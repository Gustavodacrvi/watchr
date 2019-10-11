
import { fire, auth } from './index'
import utils from '../utils'

const uid = () => auth.currentUser.uid
const fd = () => fb.firestore.FieldValue

export default {
  namespaced: true,
  state: {
    lists: [],
    order: [],
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
    sortedLists(state) {
      const {order, lists} = state
      return utils.checkMissingIdsAndSortArr(order, lists)
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
  },
  actions: {
    getData({state}) {
      if (uid())
      return Promise.all([
        new Promise(resolve => {
          fire.collection('lists').where('userId', '==', uid()).onSnapshot(snap => {
            utils.getDataFromFirestoreSnapshot(state, snap.docChanges(), 'lists')
            resolve()
          })
        }),
        new Promise(resolve => {
          fire.collection('listsOrder').doc(uid()).onSnapshot((snap => {
            state.order = snap.data().order
            resolve()
          }))
        }),
        new Promise(resolve => {
          fire.collection('viewOrders').doc(uid()).onSnapshot((snap => {
            state.viewOrders = snap.data()
            resolve()
          }))
        })
      ])
    },
    addList(c, {name, ids, index}) {
      const obj = {
        name,
        userId: uid(),
        headings: [],
        headingsOrder: [],
        tasks: [],
      }
      if (!index)
        fire.collection('lists').add(obj)
      else {
        const batch = fire.batch()
  
        const ord = ids.slice()
        const ref = fire.collection('lists').doc()
        batch.set(ref, obj)
        ord.splice(index, 0, ref.id)
        const orderRef = fire.collection('listsOrder').doc(uid())
        batch.update(orderRef, {
          order: ord,
        })
  
        batch.commit()
      }
    },
    editList(c, {name, id}) {
      fire.collection('lists').doc(id).update({
        name,
      })
    },
    updateOrder(c, ids) {
      fire.collection('listsOrder').doc(uid()).update({
        order: ids,
      })
    },
    saveList(c, list) {
      fire.collection('lists').doc(list.id).update({
        ...list,
      })
    },
    removeTaskFromList({state}, {taskId, view, ids}) {
      const batch = fire.batch()

      const taskRef = fire.collection('tasks').doc(taskId)
      batch.update(taskRef, {
        list: null, heading: null,
      })
      const obj = state.viewOrders
      obj[view].tasks = ids
      const listRef = fire.collection('viewOrders').doc(uid())
      batch.update(listRef, obj)

      batch.commit()
    },
    moveTaskToList(c, {ids, taskId, listId}) {
      const batch = fire.batch()

      const taskRef = fire.collection('tasks').doc(taskId)
      batch.update(taskRef, {
        list: listId,
      })

      batch.commit()
    },
    updateViewOrder({state}, {view, ids}) {
      const obj = state.viewOrders
      obj[view].tasks = ids
      fire.collection('viewOrders').doc(uid()).update(obj)
    },
    updateHeadingsViewOrder({state}, {view, ids}) {
      const obj = state.viewOrders
      obj[view].headings = ids
      fire.collection('viewOrders').doc(uid()).update(obj)
    },
    sortListsByName({state, dispatch}) {
      const lists = state.lists.slice()
      lists.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
      dispatch('updateOrder', lists.map(el => el.id))
    },
    deleteList({state}, {id, tasks}) {
      const list = state.lists.find(el => el.id === id)
      if (list) {
          const batch = fire.batch()
  
          const listRef = fire.collection('lists').doc(id)
          batch.delete(listRef)
  
          const toDeleteTaskIds = []
          for (const t of list.tasks) {
            const task = tasks.find(el => el.id === t.id)
            if (task) toDeleteTaskIds.push(task.id)
          }
          for (const head of list.headings) {
            for (const t of head.tasks) {
              const task = tasks.find(el => el.id === t.id) 
              if (task) toDeleteTaskIds.push(t.id)
            }
          }
          for (const id of toDeleteTaskIds) {
            const ref = fire.collection('tasks').doc(id)
            batch.update(ref, {
              list: null,
              heading: null,
            })
          }
  
          batch.commit()
      }
    },
    addTaskByIndexSmart(c, {ids, index, task, list}) {
      const batch = fire.batch()

      const taskRef = fire.collection('tasks').doc()
      batch.set(taskRef, {
        userId: uid(),
        ...task,
      })

      ids.splice(index, 0, taskRef.id)

      const obj = {}
      obj[list] = ids

      const listRef = fire.collection('viewOrders').doc(uid())
      batch.update(listRef, obj)

      batch.commit()
    },
    updateListHeadings(c, {ids, listId}) {
      fire.collection('lists').doc(listId).update({
        headingsOrder: ids,
      })
    },
    addTaskHeading({state}, {name, ids, listId, task, index}) {
      const list = state.lists.find(el => el.id === listId)
      if (list) {
        const batch = fire.batch()

        const taskRef = fire.collection('tasks').doc()
        task.list = listId
        task.heading = name
        batch.set(taskRef, {
          userId: uid(),
          ...task,
        })
        const heads = list.headings.slice()
        const i = heads.findIndex(el => el.name === name)
        ids.splice(index, 0, taskRef.id)
        heads[i].tasks = ids
        const listRef = fire.collection('lists').doc(listId)
        batch.update(listRef, {
          headings: heads,
        })

        batch.commit()
      }
    },
    addHeading({state}, {ids, name, listId, index}) {
      const list = state.lists.find(el => el.id === listId)
      if (list) {
        const batch = fire.batch()

        for (const id of ids) {
          const ref = fire.collection('tasks').doc(id)
          batch.update(ref, {
            heading: name,
          })
        }
        const headings = list.headings.slice()
        headings.splice(index, 0, {name, tasks: ids})
        const ref = fire.collection('lists').doc(listId)
        batch.update(ref, {
          headings,
          headingsOrder: headings.map(el => el.name)
        })

        batch.commit()
      }
    },
    saveHeadingName({state}, {listId, oldName, newName, tasksIds}) {
      const list = state.lists.find(el => el.id === listId)
      if (list) {
        const batch = fire.batch()
        
        const heads = list.headings.slice()
        const i = heads.findIndex(el => el.name === oldName)
        heads[i].name = newName
        for (const id of tasksIds) {
          const ref = fire.collection('tasks').doc(id)
          batch.update(ref, {
            heading: newName,
          })
        }
        const ref = fire.collection('lists').doc(listId)
        batch.update(ref, {
          headings: heads,
        })

        batch.commit()
      }
    },
    moveTaskBetweenHeadings({state}, {ids, listId, taskId, name}) {
      const list = state.lists.find(el => el.id === listId)
      if (list) {
        const batch = fire.batch()

        const taskRef = fire.collection('tasks').doc(taskId)
        batch.update(taskRef, {
          heading: name,
        })
        const heads = list.headings.slice()
        const i = heads.findIndex(el => el.name === name)
        heads[i].tasks = ids
        const listRef = fire.collection('lists').doc(listId)
        batch.update(listRef, {
          headings: heads,
        })

        batch.commit()
      }
    },
    removeTaskFromHeading({state}, {listId, taskId, ids}) {
      const list = state.lists.find(el => el.id === listId)
      if (list) {
        const batch = fire.batch()

        const taskRef = fire.collection('tasks').doc(taskId)
        batch.update(taskRef, {
          heading: null,
        })
        const listRef = fire.collection('lists').doc(listId)
        batch.update(listRef, {
          tasks: ids,
        })

        batch.commit()
      }
    },
    deleteHeadingFromList({state}, {listId, name, savedTasks}) {
      const list = state.lists.find(el => el.id === listId)
      if (list) {
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
          const ref = fire.collection('tasks').doc(id)
          batch.update(ref, {
            heading: null,
          })
        }
        const ref = fire.collection('lists').doc(listId)
        batch.update(ref, {
          headings: heads,
        })

        batch.commit()
      }
    },
    addDefaultData(c, id) {
      return Promise.all([
        fire.collection('listsOrder').doc(id).set({
          order: [],
          userId: id,
        }),
        fire.collection('viewOrders').doc(id).set({
          userId: id,
        })
      ])
    },
  },
}
