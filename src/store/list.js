
import { fire, auth } from './index'
import fb from 'firebase/app'

import utils from '../utils'
import utilsTask from "@/utils/task"
import { listRef, userRef, uid, listColl, taskRef } from '../utils/firestore'
import router from '../router'

export default {
  namespaced: true,
  state: {
    lists: [],
    invites: [],
    viewOrders: {
      'Today': {
        tasks: [],
        headings: []
      },
      'Upcoming': {
        tasks: [],
        headings: []
      },
      'Inbox': {
        tasks: [],
        headings: []
      },
      'Tomorrow': {
        tasks: [],
        headings: []
      },
    },
  },
  getters: {
    sortedLists(state, d, {userInfo}) {
      const {lists} = state
      if (userInfo)
        return utils.checkMissingIdsAndSortArr(userInfo.lists, lists)
      return []
    },
    getListsByName: state => names => {
      const arr = []
      for (const n of names) {
        const list = state.lists.find(el => el.name === n)
        if (list) arr.push(list)
      }
      return arr
    },
    getListsById: state => ids => {
      const arr = []
      for (const id of ids) {
        const list = state.lists.find(el => el.id === id)
        if (list) arr.push(list)
      }
      return arr
    },
    getListByName: state => name => {
      return state.lists.find(l => l.name.trim() === name)
    },
    getAllTasksOrderByList: state => listId => {
      const list = state.lists.find(el => el.id === listId)
      let ord = list.tasks.slice()
      
      let headsOrder = list.headingsOrder.slice() || []

      const heads = utils.checkMissingIdsAndSortArr(headsOrder, list.headings, 'name')
      
      for (const h of heads) {
        ord = [...ord, ...h.tasks]
      }
      
      return ord
    },
    getTasks: state => (tasks, id) => {
      return tasks.filter(el => el.list === id)
    },
    pieProgress: (state, getters) => (tasks, id) => {
      const ts = getters.getTasks(tasks, id)
      const numberOfTasks = ts.length
      let completedTasks = 0

      ts.forEach(el => {
        if (utilsTask.isTaskCompleted(el)) completedTasks++
      })
      const result = 100 * completedTasks / numberOfTasks
      if (isNaN(result)) return 0
      return result
    }
  },
  actions: {
    getData({state}) {
      const id = uid()
      if (id)
      return Promise.all([
        new Promise(resolve => {
/*           fire.collection('lists').where(`users.${id}`, '==', true).onSnapshot(snap => {
            utils.getDataFromFirestoreSnapshot(state, snap.docChanges(), 'lists')
            resolve()
          }) */
          resolve()
        }),
        new Promise(resolve => {
          listColl().where('userId', '==', uid()).where('userId', '==', id).onSnapshot(snap => {
            utils.getDataFromFirestoreSnapshot(state, snap.docChanges(), 'lists')
            resolve()
          })
        }),
      ])
    },

    // ADD

    duplicateList(c, {list, rootTasks, headingTasks}) {
      const batch = fire.batch()

      const name = list.name + ' (2)'
      const newListRef = listRef()

      const createTasks = (arr, tasks) => {
        for (const t of tasks) {
          const ref = taskRef()
          batch.set(ref, {
            ...t, id: null, list: newListRef.id
          })
          arr.push({
            oldId: t.id,
            newId: ref.id,
          })
        }
      }

      const newRootTasks = []
      const newHeadingTasks = []
      createTasks(newRootTasks, rootTasks)
      createTasks(newHeadingTasks, headingTasks)

      const headings = list.headings.slice()
      const headingsOrder = list.headingsOrder.slice()

      for (const h of headings) {
        const newIds = []
        for (const id of h.tasks) {
          const task = newHeadingTasks.find(t => t.oldId === id)
          newIds.push(task.newId)
        }
        h.tasks = newIds
      }

      batch.set(newListRef, {
        headingsOrder,
        headings,
        name,
        tasks: newRootTasks.map(t => t.newId),
        userId: uid(),
        users: {[uid()]: true},
      })

      batch.commit()
    },
    addList({rootState}, {name, ids, index}) {
      const obj = {
        name,
        smartViewsOrders: {},
        userId: uid(),
        users: {[uid()]: true},
        headings: [],
        headingsOrder: [],
        tasks: [],
        ownerInfo: rootState.userInfo,
      }
      if (!index)
        userRef().collection('lists').add(obj)
      else {
        const batch = fire.batch()
  
        const ord = ids.slice()
        const ref = listRef()
        batch.set(ref, obj)
        ord.splice(index, 0, ref.id)
        const orderRef = userRef()
        batch.update(orderRef, {
          lists: ord,
        })
  
        batch.commit()
      }
    },
    convertHeadingToList({state, getters}, {listId, taskIds, name}) {
      const list = getters.getListsById([listId])[0]
      const batch = fire.batch()

      const heads = list.headings.slice()
      const i = heads.findIndex(el => el.name === name)
      heads.splice(i, 1)

      const oldListRef = listRef(listId)
      batch.update(oldListRef, {
        headings: heads,
      })
      
      const newList = listRef()
      batch.set(newList, {
        name,
        userId: uid(),
        users: {[uid()]: true},
        smartViewsOrders: {},
        headings: [],
        headingsOrder: [],
        tasks: taskIds,
      })
      for (const id of taskIds) {
        const ref = taskRef(id)
        batch.update(ref, {
          list: newList.id,
          heading: null,
        })
      }

      batch.commit()
    },

    // EDIT
    
    saveList(c, list) {
      listRef(list.id).update({
        ...list,
      })
    },
    updateOrder(c, lists) {
      userRef().update({lists})
    },
    updateViewOrder({state}, {view, ids}) {
      const obj = {}
      obj[view] = {}
      obj[view].tasks = ids
      userRef().set({
        viewOrders: obj,
      }, {merge: true})
    },
    sortListsByName({state, dispatch}) {
      const lists = state.lists.slice()
      lists.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
      dispatch('updateOrder', lists.map(el => el.id))
    },

    // SHARE LIST
    
    addPendingUser({state}, {listId, userInfo, tasks}) {
      const list = state.lists.find(li => li.id === listId)
      const removeNonExistent = ids =>
        ids.filter(id => tasks.some(el => el.id === id))
      
      const batch = fire.batch()

      let rootTaskids = removeNonExistent(list.tasks.slice())
      let taskIds = rootTaskids.slice()
      const heads = list.headings.slice()
      for (const h of heads) {
        h.tasks = removeNonExistent(h.tasks)
        taskIds = [...taskIds, ...h.tasks.slice()]
      }

      const listRef = fire.collection('lists').doc(listId)
      batch.set(listRef, {
        usersStatus: {[userInfo.userId]: 'pending'},
        userData: {[userInfo.userId]: userInfo},
        tasks: rootTaskids,
        headings: heads,
      }, {merge: true})

      for (const id of taskIds) {
        const taskRef = fire.collection('tasks').doc(id)
        batch.set(taskRef, {
          usersStatus: {[userInfo.userId]: 'pending'},
        }, {merge: true})
      }

      batch.commit()
    },
    rejectInvite({state}, listId) {
      const batch = fire.batch()
      
      const list = state.invites.find(li => li.id === listId)
      const listRef = fire.collection('lists').doc(listId)
      const obj = {
        usersStatus: {[uid()]: 'rejected'},
      }
      batch.set(listRef, obj, {merge: true})
      let taskIds = list.tasks.slice()
      for (const h of list.headings) {
        taskIds = [...taskIds, ...h.tasks.slice()]
      }
      for (const id of taskIds) {
        const taskRef = fire.collection('tasks').doc(id)
        batch.set(taskRef, obj, {merge: true})
      }

      batch.commit()
    },
    acceptInvite({state}, listId) {
      const batch = fire.batch()
      
      const list = state.invites.find(li => li.id === listId)
      const listRef = fire.collection('lists').doc(listId)
      batch.set(listRef, {
        usersStatus: {[uid()]: false},
        users: {[uid()]: true},
      }, {merge: true})
      let taskIds = list.tasks.slice()
      for (const h of list.headings) {
        taskIds = [...taskIds, ...h.tasks.slice()]
      }
      for (const id of taskIds) {
        const taskRef = fire.collection('tasks').doc(id)
        batch.set(taskRef, {
          users: {[uid()]: true},
          usersStatus: {[uid()]: false},
        }, {merge: true})
      }

      batch.commit()
    },
    removeUser({state}, {listId, userId}) {
      const batch = fire.batch()
      
      const list = state.lists.find(li => li.id === listId)
      const listRef = fire.collection('lists').doc(listId)
      batch.set(listRef, {
        usersStatus: {[userId]: false},
        userData: {[userId]: false},
        users: {[userId]: false},
      }, {merge: true})
      let taskIds = list.tasks.slice()
      for (const h of list.headings) {
        taskIds = [...taskIds, ...h.tasks.slice()]
      }
      for (const id of taskIds) {
        const taskRef = fire.collection('tasks').doc(id)
        batch.set(taskRef, {
          usersStatus: {[userId]: false},
          userData: {[userId]: false},
          users: {[userId]: false},
        }, {merge: true})
      }

      batch.commit()
    },
    toggleHeadingAuthide({state}, {listId, name}) {
      const list = state.lists.find(el => el.id === listId)
      if (list) {
        const heads = list.headings.slice()
        const i = heads.findIndex(el => el.name === name)

        heads[i].autoHide = !heads[i].autoHide
        fire.collection('lists').doc(listId).update({
          headings: heads,
        })
      }
    },

    // TASKS
    
    addTaskByIndexSmart(c, {ids, index, task, list}) {
      const batch = fire.batch()

      const newTaskRef = taskRef()
      batch.set(newTaskRef, {
        userId: uid(),
        users: {[uid()]: true},
        ...task,
      })

      ids.splice(index, 0, taskRef.id)

      const obj = {}
      // list === viewName, e.g: Today, Tomorrow
      obj[list] = ids

      const listRef = userRef()
      batch.set(listRef, {
        viewOrders: obj,
      }, {merge: true})

      batch.commit()
    },
    addTaskByIndex(c, {ids, index, task, listId}) {
      const batch = fire.batch()

      const newTaskRef = taskRef()
      batch.set(newTaskRef, {
        userId: uid(),
        ...task,
      })

      ids.splice(index, 0, taskRef.id)

      const savedListRef = listRef(listId)
      batch.update(savedListRef, {tasks: ids})

      batch.commit()
    },
    uncompleteHeadingTasks({getters}, {name, listId, savedTasks}) {
      const list = getters.getListsById([listId])[0]
      const batch = fire.batch()
      
      const head = list.headings.find(el => el.name === name)
      const ids = []
      for (const i of head.tasks) {
        const task = savedTasks.find(el => el.id === i)
        if (task) ids.push(task.id)
      }
      for (const id of ids) {
        const ref = taskRef(id)
        batch.update(ref, {
          completeDate: null,
          completed: false,
        })
      }

      batch.commit()
    },
    removeTasksFromList(c, {taskIds, view, ids}) {
      const batch = fire.batch()

      for (const id of taskIds) {
        const taskRef = taskRef(id)
        batch.update(taskRef, {
          list: null, heading: null,
        })
      }
      const obj = {}
      obj[view] = {}
      obj[view].tasks = ids
      const user = userRef()
      batch.set(user, {
        viewOrders: obj,
      }, {merge: true})

      batch.commit()
    },
    moveTasksToList({getters}, {ids, taskIds, listId, smartView}) {
      const list = getters.getListsById([listId])[0]
      const batch = fire.batch()
      let views = list.smartViewsOrders
      if (!views) views = {}
      views[smartView] = ids

      for (const id of taskIds) {
        const taskRef = taskRef(id)
        batch.update(taskRef, {
          list: listId,
          heading: null,
        })
      }
      const listRef = fire.collection('lists').doc(listId)
      batch.update(listRef, {
        smartViewsOrders: views,
      })

      batch.commit()
    },

    // HEADING
    
    addHeading({getters}, {ids, name, listId, index}) {
      const list = getters.getListsById([listId])[0]
      const batch = fire.batch()

      for (const id of ids) {
        const ref = taskRef(id)
        batch.update(ref, {
          heading: name,
        })
      }
      const headings = list.headings.slice()
      headings.splice(index, 0, {name, tasks: ids})
      const ref = listRef(listId)
      batch.update(ref, {
        headings,
        headingsOrder: headings.map(el => el.name)
      })

      batch.commit()
    },
    saveHeadingName({getters}, {listId, oldName, newName, tasksIds}) {
      const list = getters.getListsById([listId])[0]
      const batch = fire.batch()
      
      const heads = list.headings.slice()
      const i = heads.findIndex(el => el.name === oldName)
      heads[i].name = newName
      for (const id of tasksIds) {
        const ref = taskRef(id)
        batch.update(ref, {
          heading: newName,
        })
      }
      const ref = listRef(listId)
      batch.update(ref, {
        headings: heads,
      })

      batch.commit()
    },
    moveTasksBetweenHeadings({getters}, {ids, listId, taskIds, name}) {
      const list = getters.getListsById([listId])[0]
      const batch = fire.batch()

      for (const id of taskIds) {
        const task = taskRef(id)
        batch.update(task, {
          heading: name,
        })
      }
      const heads = list.headings.slice()
      const i = heads.findIndex(el => el.name === name)
      heads[i].tasks = ids
      const listRef = listRef(listId)
      batch.update(listRef, {
        headings: heads,
      })

      batch.commit()
    },
    removeTasksFromHeading(c, {listId, taskIds, ids}) {
      const batch = fire.batch()

      for (const id of taskIds) {
        const task = taskRef(id)
        batch.update(task, {
          heading: null,
        })
      }
      const listRef = listRef(listId)
      batch.update(listRef, {
        tasks: ids,
      })

      batch.commit()
    },
    deleteHeadingFromList({getters}, {listId, name, savedTasks}) {
      const list = getters.getListsById([listId])[0]
      const batch = fire.batch()

      const heads = list.headings.slice()
      const i = heads.findIndex(el => el.name === name)
      const tasks = heads[i].tasks.slice()
      const ts = []
      for (const t of tasks) {
        const task = savedTasks.find(el => el.id === t.id)
        if (task) ts.push(task)
      }
      heads.splice(i, 1)
      for (const id of ts) {
        const ref = taskRef(id)
        batch.update(ref, {
          heading: null,
        })
      }
      const ref = listRef(listId)
      batch.update(ref, {
        headings: heads,
      })

      batch.commit()
    },
    updateHeadingsTaskIds({getters}, {listId, name, ids}) {
      const list = getters.getListsById([listId])[0]
      const heads = list.headings.slice()
      const i = heads.findIndex(el => el.name === name)
      heads[i].tasks = ids
      listRef(listId).update({
        headings: heads,
      })
    },
    updateListHeadings(c, {ids, listId}) {
      listRef(listId).update({
        headingsOrder: ids,
      })
    },
    saveSmartViewHeadingTasksOrder({getters}, {ids, listId, smartView}) {
      const list = getters.getListsById([listId])[0]
      let views = list.smartViewsOrders
      if (!views) views = {}
      views[smartView] = ids
      listRef(listId).update({
        smartViewsOrders: views,
      })
    },
    duplicateHeading({getters}, {name, listId, tasks}) {
      const list = getters.getListsById([listId])[0]
      const batch = fire.batch()

      const newHeadingName = name += ' (2)'
      const newTaskIds = []
      for (const t of tasks) {
        const ref = taskRef()
        batch.set(ref, {
          ...t, heading: newHeadingName, id: null,
        })
        newTaskIds.push(ref.id)
      }

      const heads = list.headings.slice()
      heads.push({
        name: newHeadingName,
        tasks: newTaskIds,
      })
      const order = list.headingsOrder.slice()
      const i = order.findIndex(n => n === name)
      order.splice(i, 0, newHeadingName)

      const newListRef = listRef(listId)
      batch.update(newListRef, {
        headingsOrder: order,
        headings: heads,
      })

      batch.commit()
    },
    updateHeadingsViewOrder({state}, {view, ids}) {
      const obj = {}
      obj[view] = {}
      obj[view].headings = ids
      userRef().set({
        viewOrders: obj,
      }, {merge: true})
    },
    addTaskHeading({getters}, {name, ids, listId, task, index}) {
      const list = getters.getListsById([listId])[0]
      const batch = fire.batch()

      const newTaskRef = taskRef()
      task.list = listId
      task.heading = name
      batch.set(newTaskRef, {
        userId: uid(),
        ...task,
      })
      const heads = list.headings.slice()
      const i = heads.findIndex(el => el.name === name)
      ids.splice(index, 0, taskRef.id)
      heads[i].tasks = ids
      const savedListRef = listRef(listId)
      batch.update(savedListRef, {
        headings: heads,
      })

      batch.commit()
    },

    deleteList(c, {listId, tasks}) {
      const batch = fire.batch()

      const deleteListRef = listRef(listId)
      batch.delete(deleteListRef)

      const ids = []
      for (const t of tasks) {
        if (t.list === listId) ids.push(t.id)
      }
      for (const id of ids) {
        const ref = taskRef(id)
        batch.update(ref, {
          list: null,
          heading: null,
        })
      }

      batch.commit()
      router.push('/user')
    },
    importTemplate(c, {list, tasks}) {
      const batch = fire.batch()

      const newListRef = listRef()

      const taskIds = {}
      const listId = newListRef.id
      for (const t of tasks) {
        const ref = taskRef()
        batch.set(ref, {
          ...t, list: listId, id: ref.id, userId: uid(),
          users: {[uid()]: true},
        })
        taskIds[t.id] = ref.id
      }

      const heads = list.headings
      for (const h of heads) {
        const newids = []
        for (const id of h.tasks) {
          newids.push(taskIds[id])
        }
        h.tasks = newids
      }
      const newTasks = []
      for (const id of list.tasks)
        newTasks.push(taskIds[id])
      list.tasks = newTasks
      
      list.smartViewsOrders = {}
      batch.set(newListRef, {
        ...list, id: listId, userId: uid(),
        users: {[uid()]: true},
      })

      batch.commit()
    },
    deleteAllData({state}) {
      for (const el of state.lists)
        fire.collection('lists').doc(el.id).delete()
      fire.collection('listsOrder').doc(uid()).delete()
      fire.collection('viewOrders').doc(uid()).delete()
    },
  },
}
