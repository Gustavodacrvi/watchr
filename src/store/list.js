
import { fire, auth } from './index'
import utils from '../utils'

const uid = () => {
  return auth.currentUser.uid
}

export default {
  namespaced: true,
  state: {
    lists: [],
    listsOrder: [],
  },
  getters: {
    sortedLists(state) {
      const {listsOrder, lists} = state
      return utils.checkMissingIdsAndSortArr(listsOrder, lists)
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
            state.listsOrder = snap.data().order
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
    sortListsByName({state, dispatch}) {
      const lists = state.lists.slice()
      lists.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
      dispatch('updateOrder', lists.map(el => el.id))
    },
    deleteList(c, id) {
      return fire.collection('lists').doc(id).delete()
    },
    addDefaultData(c, id) {
      return fire.collection('listsOrder').doc(id).set({
        order: [],
        userId: uid(),
      })
    },
  },
}
