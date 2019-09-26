
import { fire, auth } from './index'
import utils from '../utils'

const uid = () => {
  return auth.currentUser.uid
}

export default {
  namespaced: true,
  state: {
    lists: [],
    order: [],
    viewOrders: {
      'Today': [],
      'Upcoming': [],
      'Inbox': [],
      'Tomorrow': [],
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
    addList(c, {name}) {
      console.log('addList', name)
      return fire.collection('lists').add({
        name,
        userId: uid(),
        descr: '',
      })
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
    updateViewOrder(c, {view, ids}) {
      const obj = {}
      obj[view] = ids
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
    addDefaultData(c, id) {
      return Promise.all([
        fire.collection('listsOrder').doc(id).set({
          order: [],
          userId: uid(),
        }),
        fire.collection('viewOrders').doc(id).set({
          userId: uid(),
          Today: [],
          Upcoming: [],
          Inbox: [],
          Tomorrow: [],
        })
      ])
    },
  },
}
