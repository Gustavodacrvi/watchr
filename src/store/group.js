
import { fire, auth } from './index'
import fb from 'firebase/app'

import utils from '../utils'
import utilsTask from '../utils/task'
import MemoizeGetters from './memoFunctionGetters'
import { uid, deleteFolder, setFolder, serverTimestamp, setInfo, setTask, batchSetLists,setList, cacheBatchedItems, batchSetTasks } from '../utils/firestore'
import mom from 'moment'

export default {
  namespaced: true,
  state: {
    groups: {},
  },
  getters: {
    groups(state) {
      const keys = Object.keys(state.groups).filter(k => state.groups[k])
      return keys.map(k => state.groups[k])
    },
    sortedGroups(state, d, {userInfo}, rootGetters) {
      let order = userInfo.groups
      if (!order) order = []
      if (userInfo)
        return rootGetters.checkMissingIdsAndSortArr(order, d.groups)
      return []
    },
    ...MemoizeGetters('groups', {
      getFolderTaskOrderById({state, getters}, groupId) {
        const gro = getters.groups.find(f => f.id === groupId)
        if (gro && gro.tasks)
          return gro.tasks
        return []
      },
      getListsByFolderId: {
        react: [
          'order'
        ],
        getter({state, getters, rootGetters}, {id, lists}) {
          const arr = []
          const gro = getters.groups.find(f => f.id === id)
          for (const l of lists)
            if (l.group && l.group === id) arr.push(l)
          let order = gro.order
          if (!order) order = []
          return rootGetters.checkMissingIdsAndSortArr(order, arr)
        },
      },
      getGroupsByName: {
        react: [
          'name',
        ],
        getter({state, getters}, names) {
          const arr = []
          for (const n of names) {
            const gro = getters.groups.find(f => f.name === n)
            if (gro) arr.push(gro)
          }
          return arr
        },
      },
      getGroupsById({state, getters}, ids) {
        const arr = []
        for (const f of getters.groups)
          if (ids.includes(f.id)) arr.push(f)
        return arr
      },
    }, true),
    getFavoriteGroups(state, getters) {
      return getters.groups.filter(f => f.favorite).map(f => ({...f, icon: 'group', color: 'var(--txt)'}))
    },
  },
  actions: {
    addFolder({rootState}, gro) {
      const b = fire.batch()
      
      setFolder(b, {
        tasks: [],
        files: [],
        createdFire: serverTimestamp(),
        created: mom().format('Y-M-D HH:mm ss'),
        ...gro,
        defaultShowing: true,
      }, undefined, rootState)

      b.commit()
    },
    updateGroupsOrder(c, ids) {
      const b = fire.batch()
      
      setInfo(b, {
        groups: ids,
      })

      b.commit()
    },
    updateOrder({rootState}, {id, ids}) {
      const b = fire.batch()
      
      setFolder(b, {
        order: ids,
      }, id, rootState)

      b.commit()
    },
    saveFolder({rootState}, gro) {
      const b = fire.batch()
      
      setFolder(b, gro, gro.id, rootState)

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

      setFolder(b, {order: ids}, group, rootState, writes)
      setList(b, {group}, id, rootState, writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },
    moveTasksToFolder({getters, rootState}, {ids, taskIds, groupId, smartView}) {
      const gro = getters.getGroupsById([groupId])[0]
      const b = fire.batch()

      let views = gro.smartViewsOrders
      if (!views) views = {}
      views[smartView] = ids

      const writes = []

      batchSetTasks(b, {
        list: null,
        group: groupId,
        heading: null,
      }, taskIds, rootState, writes)

      setFolder(b, {
        smartViewsOrders: views,
      }, groupId, rootState, writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },
    moveTasksToFolderCalendarOrder({rootState}, {ids, taskIds, date, groupId}) {
      const b = fire.batch()

      const writes = []
      
      batchSetTasks(b, {
        group: groupId,
        list: null,
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
      setFolder(b, {tasks: ids}, groupId, rootState, writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },
    deleteFolderById({getters, rootState}, {id, lists, tasks}) {
      const b = fire.batch()

      const groupLists = getters.getListsByFolderId({id, lists})
      const groupTasks = tasks.filter(t => t.group === id)

      const writes = []
      
      batchSetLists(b, {
        group: null,
      }, groupLists.map(el => el.id), rootState, writes)

      batchSetTasks(b, {
        group: null,
      }, groupTasks.map(el => el.id), rootState, writes)
    
      deleteFolder(b, id, rootState, writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },
    saveSmartViewHeadingTasksOrder({getters}, {ids, groupId, smartView}) {
      const group = getters.getGroupsById([groupId])[0]
      let views = group.smartViewsOrders
      if (!views) views = {}
      views[smartView] = ids

      const batch = fire.batch()

      setFolder(batch, {smartViewsOrders: views}, groupId, rootState)

      batch.commit()
    },
  },
}
