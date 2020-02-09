
import { fire, auth } from './index'
import fb from 'firebase/app'

import utils from '../utils'
import utilsTask from '../utils/task'
import MemoizeGetters from './memoFunctionGetters'
import { uid, deleteGroup, addGroup, serverTimestamp, setInfo, setTask, batchSetLists,setList, cacheBatchedItems, batchSetTasks, setGroup, setGroupInfo } from '../utils/firestore'
import mom from 'moment'

export default {
  namespaced: true,
  state: {
    groups: [],
  },
  getters: {
    sortedGroupsByName(state) {
      const groups = state.groups
      groups.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
      return groups
    },
    ...MemoizeGetters('groups', {
      getGroupTaskOrderById({state}, groupId) {
        const gro = state.groups.find(f => f.id === groupId)
        if (gro && gro.order)
          return gro.order
        return []
      },
      getListsByGroupId: {
        react: [
          'order'
        ],
        getter({state, rootGetters}, {id, lists}) {
          const arr = []
          const gro = state.groups.find(f => f.id === id)
          for (const l of lists)
            if (l.group && l.group === id) arr.push(l)

          let order = gro.listsOrder
          if (!order) order = []
          return rootGetters.checkMissingIdsAndSortArr(order, arr)
        },
      },
      sortedGroups(state, d, {userInfo}, rootGetters) {
        let order = userInfo.folders
        if (!order) order = []
        if (userInfo)
          return rootGetters.checkMissingIdsAndSortArr(order, state.groups)
        return []
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
      getGroupsById({state}, ids) {
        const arr = []
        for (const f of state.groups)
          if (ids.includes(f.id)) arr.push(f)
        return arr
      },
    }),
    getFavoriteGroups(state, getters) {
      return getters.groups.filter(f => f.favorite).map(f => ({...f, icon: 'group', color: 'var(--txt)'}))
    },
  },
  actions: {
    addGroup({rootState}, gro) {
      const b = fire.batch()
      
      addGroup(b, gro.name, rootState)

      b.commit()
    },
    saveGroupName({rootState}, gro) {
      const b = fire.batch()
      
      setGroupInfo(b, {
        name: gro.name,
      }, gro.id, rootState)

      b.commit()
    },
    saveGroup({rootState}, gro) {
      const b = fire.batch()
      
      setGroup(b, gro, gro.id, rootState)

      b.commit()
    },
    moveListToRoot({rootState}, {id, ids}) {
      const b = fire.batch()

      const writes = []

      setInfo(b, {lists: ids}, writes)
      setList(b, {group: null}, id, rootState, writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },
    moveListBetweenGroups({rootState}, {group, id, ids}) {
      const b = fire.batch()

      const writes = []

      setGroup(b, {listsOrder: ids}, group, rootState, writes)
      setList(b, {group, folder: null}, id, rootState, writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },
    moveTasksToGroup({rootState}, {ids, taskIds, groupId, viewName}) {
      const b = fire.batch()

      const writes = []

      batchSetTasks(b, {
        list: null,
        group: groupId,
        folder: null,
        heading: null,
      }, taskIds, rootState, writes)

      setGroup(b, {
        smartViewsOrders: {
          [viewName]: {
            [uid()]: ids,
          },
        },
      }, groupId, rootState)

      cacheBatchedItems(b, writes)

      b.commit()
    },
    moveTasksToGroupCalendarOrder({rootState}, {ids, taskIds, date, groupId}) {
      const b = fire.batch()

      const writes = []
      
      batchSetTasks(b, {
        group: groupId,
        list: null,
        folder: null,
        heading: null,
      }, taskIds, rootState, writes)

      const calendarOrders = utilsTask.getUpdatedCalendarOrders(ids, date, rootState)
      
      setInfo(b, {calendarOrders}, writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },
    async addTaskByIndex({rootState}, {ids, index, task, groupId, newTaskRef}) {
      
      const b = fire.batch()

      const writes = []

      await setTask(b, {
        userId: uid(),
        ...task,
      }, rootState, newTaskRef.id, writes)
      ids.splice(index, 0, newTaskRef.id)
      setGroup(b, {order: ids}, groupId, rootState, writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },
    delete({rootState}, groupId) {
      const b = fire.batch()

      deleteGroup(b, groupId, rootState)

      b.commit()
    },
    updateOrder({rootState}, {id, ids}) {
      const b = fire.batch()
      
      setGroup(b, {
        listsOrder: ids,
      }, id, rootState)

      b.commit()
    },
    saveSmartViewHeadingTasksOrder({rootState}, {ids, groupId, viewName}) {
      const b = fire.batch()

      setGroup(b, {
        smartViewsOrders: {
          [viewName]: {
            [uid()]: ids,
          },
        }
      }, groupId, rootState)

      b.commit()
    },
  },
}
