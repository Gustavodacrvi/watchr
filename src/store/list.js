
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
        tasks: [],
      }
      if (!index)
        return fire.collection('lists').add(obj)
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
    },
    editList(c, {name, id}) {
      return fire.collection('lists').doc(id).update({
        name,
      })
    },
    updateOrder(c, ids) {
      return fire.collection('listsOrder').doc(uid()).update({
        order: ids,
      })
    },
    saveList(c, list) {
      return fire.collection('lists').doc(list.id).update({
        ...list,
      })
    },
    updateViewOrder(c, {view, ids}) {
      const obj = {}
      obj[view] = {}
      obj[view].tasks = ids
      return fire.collection('viewOrders').doc(uid()).update(obj)
    },
    sortListsByName({state, dispatch}) {
      const lists = state.lists.slice()
      lists.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
      dispatch('updateOrder', lists.map(el => el.id))
    },
    deleteList(c, id) {
      return fire.collection('lists').doc(id).delete()
    },
    addTaskByIndexSmart({ getters }, {ids, index, task, list}) {
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

      return batch.commit()
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
