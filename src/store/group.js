
import { fire, auth } from './index'
import fb from 'firebase/app'

import utils from '../utils'
import utilsTask from '../utils/task'
import utilsList from '../utils/list'
import MemoizeGetters from './memoFunctionGetters'
import { uid, deleteGroup, addGroup, setInfo, setTask, batchSetLists,setList, cacheBatchedItems, readComments, addComment, batchSetTasks, deleteComment,setGroup, setGroupInfo } from '../utils/firestore'

import mom from 'moment'

const TOD_DATE = mom().format('Y-M-D')

export default {
  namespaced: true,
  state: {
    groups: [],
  },
  getters: {
    sortedGroupsByName(state) {
      const groups = state.groups.slice()
      groups.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
      return groups
    },
    sortedGroups(state, d, {userInfo}, rootGetters) {
      let order = userInfo.folders
      if (!order) order = []
      if (userInfo)
        return rootGetters.checkMissingIdsAndSortArr(order, state.groups)
      return []
    },
    getAssigneeIconDrop: (s, getters, rootState) => ({group = null}, assignUser) => {
      const itemGroup = getters.getGroupsById([group])[0]
      if (!itemGroup)
        return;
      const profiles = itemGroup.profiles
      const profileUsers = Object.keys(profiles).map(k => ({
        name: profiles[k].displayName,
        uid: profiles[k].uid,
        id: profiles[k].uid,
        photoURL: profiles[k].photoURL,
        callback: () => assignUser(profiles[k].uid),
      }))
      
      const user = rootState.user
      const links = profileUsers.filter(p => p.uid !== user.uid)

      links.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
      
      links.unshift({
        name: user.displayName,
        icon: 'crown',
        id: user.uid,
        color: 'var(--yellow)',
        callback: () => assignUser(user.uid),
      })
      links.unshift({
        name: "Remove assignee",
        icon: 'trash',
        id: user.uid + 'assigned',
        callback: () => assignUser(null),
      })
      return {
        center: true,
        name: 'Assign user',
        icon: 'group',
        links,
        callback: () => ({
          allowSearch: true,
          links,
        }),
        allowSearch: true,
      }
    },
    getFavoriteGroups(state) {
      return state.groups.filter(f => f.favorite).map(f => ({...f, icon: 'group', color: 'var(--txt)'}))
    },
    ...MemoizeGetters({
      getAllNonReadComments: {
        touchGetters: [
          'group/getGroupsById',
          'group/nonReadCommentsById',
        ],
        getter({}, groupId) {
          const group = this['group/getGroupsById']([groupId])[0]
          if (group.comments) {
            return Object.keys(group.comments).map(id =>
              this['group/nonReadCommentsById'](groupId, id)
            ).flat()
          }
          return []
        },
      },
      nonReadCommentsById: {
        touchGetters: [
          'group/getGroupsById',
        ],
        getter({}, groupId, id) {
          const group = this['group/getGroupsById']([groupId])[0]
          if (group) {
            const groupComments = group.comments || {}
            const room = groupComments[id]
            const userId = uid()
            if (room) {
              return Object.keys(room).filter((k) => {
                if (!room[k]) return false

                const isOwner = room[k].userId === userId
                const read = room[k].readBy && room[k].readBy[userId]
                
                return !(isOwner || read)
              })
            }
          }
          return []
        },
      },
      getGroupTaskOrderById: {
        deepStateTouch: {
          'group/groups': [
            'order',
          ],
        },
        getter({}, groupId) {
          const gro = this['group/groups'].find(f => f.id === groupId)
          if (gro && gro.order)
            return gro.order
          return []
        },
        cache(args) {
          return args[0]
        },
      },
      getListsByGroupId: {
        deepStateTouch: {
          'group/groups': [
            'listsOrder',
          ],
        },
        deepGetterTouch: {
          'list/lists': [
            'completed',
            'canceled',
            'folder',
            'calendar',
            'group',
            'assigned',
          ],
          'task/allTasks': [
            'calendar',
            'completed',
            'list',
            'folder',
            'group',
          ]
        },
        getter({rootGetters}, id) {
          const arr = []
          const gro = this['group/groups'].find(f => f.id === id)
          const lists = utilsList.filterSidebarLists(rootGetters, this['list/lists'], TOD_DATE)
          for (const l of lists)
            if (l.group && l.group === id) arr.push(l)
            
          let order = gro.listsOrder
          if (!order) order = []
          const res = rootGetters.checkMissingIdsAndSortArr(order, arr)
          return res
        },
        cache(args) {
          return args[0]
        },
      },
      getGroupsByName: {
        react: [
          'name',
        ],
        getter({state}, names) {
          const arr = []
          for (const n of names) {
            const gro = state.groups.find(f => f.name === n)
            if (gro) arr.push(gro)
          }
          return arr
        },
      },
      getGroupsById: {
        deepStateTouch: {
          'group/groups': [
            'profiles',
            'users',
            'comments',
          ]
        },
        getter({}, ids) {
          const arr = []
          for (const f of this['group/groups'])
            if (ids.includes(f.id)) arr.push(f)
          return arr
        },
      },
    }),
  },
  actions: {
    async addGroup({rootState}, gro) {
      const b = fire.batch()
      
      await addGroup(b, gro, rootState)

      b.commit()
    },
    deleteComment({rootState}, obj) {
      const b = fire.batch()

      deleteComment(b, obj.group, obj.id, obj.commentId, rootState)
      
      b.commit()
    },
    readComments({rootState}, obj) {
      const b = fire.batch()

      readComments(b, obj.groupId, obj.room, obj.ids, rootState)

      b.commit()
    },
    addComment({rootState}, obj) {
      const b = fire.batch()

      addComment(b, obj.group, obj.id, utils.getUid(), obj.name, rootState)

      b.commit()
    },
    saveGroupName({rootState}, gro) {
      const b = fire.batch()
      
      setGroupInfo(b, {
        name: gro.name,
      }, gro.id, rootState)

      b.commit()
    },
    async saveGroup({rootState}, gro) {
      const b = fire.batch()
      
      await setGroup(b, gro, gro.id, rootState)

      b.commit()
    },
    moveListToRoot({rootState}, {id, ids}) {
      const b = fire.batch()

      const writes = []

      setInfo(b, {lists: ids}, rootState, writes)
      setList(b, {group: null}, id, rootState, writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },
    async moveListBetweenGroups({rootState}, {group, itemIds, ids}) {
      const b = fire.batch()

      const writes = []

      await setGroup(b, {listsOrder: ids}, group, rootState, writes)
      batchSetLists(b, {
        group, folder: null,
      }, itemIds, rootState, writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },
    delete({rootState}, groupId) {
      const b = fire.batch()

      deleteGroup(b, groupId, rootState)

      b.commit()
    },
    async updateOrder({rootState}, {id, ids}) {
      const b = fire.batch()
      
      await setGroup(b, {
        listsOrder: ids,
      }, id, rootState)

      b.commit()
    },
  },
}
