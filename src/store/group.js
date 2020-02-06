
import { fire, auth } from './index'
import fb from 'firebase/app'

import utils from '../utils'
import utilsTask from '../utils/task'
import MemoizeGetters from './memoFunctionGetters'
import { uid, deleteGroup, addGroup, serverTimestamp, setInfo, setTask, batchSetLists,setList, cacheBatchedItems, batchSetTasks, setGroupInfo } from '../utils/firestore'
import mom from 'moment'

export default {
  namespaced: true,
  state: {
    groups: [],
  },
  getters: {
    ...MemoizeGetters('groups', {
      getGroupTaskOrderById({state, getters}, groupId) {
        const gro = getters.groups.find(f => f.id === groupId)
        if (gro && gro.tasks)
          return gro.tasks
        return []
      },
      getListsByGroupId: {
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
        getter({state}, names) {
          const arr = []
          for (const n of names) {
            const gro = state.groups.find(f => f.name === n)
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
    saveGroup({rootState}, gro) {
      const b = fire.batch()
      
      setGroupInfo(b, {
        name: gro.name,
      }, gro.id, rootState)

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

      setGroup(b, {order: ids}, group, rootState, writes)
      setList(b, {group}, id, rootState, writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },
    moveTasksToGroup({getters, rootState}, {ids, taskIds, groupId, smartView}) {
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

      setGroup(b, {
        smartViewsOrders: views,
      }, groupId, rootState, writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },
    moveTasksToGroupCalendarOrder({rootState}, {ids, taskIds, date, groupId}) {
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
      console.log(ids, index, task, groupId, newTaskRef)
      
      const b = fire.batch()

      const writes = []

      await setTask(b, {
        userId: uid(),
        ...task,
      }, rootState, newTaskRef.id, writes)
      ids.splice(index, 0, newTaskRef.id)
      setGroup(b, {tasks: ids}, groupId, rootState, writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },
    delete({rootState}, groupId) {
      const b = fire.batch()

      deleteGroup(b, groupId, rootState)

      b.commit()
    },
    saveSmartViewHeadingTasksOrder({getters}, {ids, groupId, smartView}) {
      const group = getters.getGroupsById([groupId])[0]
      let views = group.smartViewsOrders
      if (!views) views = {}
      views[smartView] = ids

      const batch = fire.batch()

      setGroup(batch, {smartViewsOrders: views}, groupId, rootState)

      batch.commit()
    },
  },
}
