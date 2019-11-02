
import { fire, auth } from './index'
import utils from '../utils'

const uid = () => {
  return auth.currentUser.uid
}

export default {
  namespaced: true,
  state: {
    filters: [],
    order: [],
  },
  getters: {
    sortedFilters(state) {
      const {order, filters} = state
      return utils.checkMissingIdsAndSortArr(order, filters)
    }
  },
  actions: {
    getData({state}) {
      if (uid())
        return Promise.all([
          new Promise(resolve => {
            /* fire.collection('filters').where('userId', '==', uid()).onSnapshot(snap => {
              utils.getDataFromFirestoreSnapshot(state, snap.docChanges(), 'filters')
            }) */
            resolve()
          }),
          new Promise(resolve => {
            /* fire.collection('filtersOrder').doc(uid()).onSnapshot(snap => {
              state.order = snap.data().order
              if (!state.order) state.order = []
            }) */
            resolve()
          })
        ])
    },
    deleteTag(c, id) {

    },
    updateOrder(c, ids) {

    },
    sortFiltersByName() {

    },
    addDefaultData(c, id) {
      fire.collection('filtersOrder').doc(id).set({
        userId: id,
      }, {merge: true})
    },
    deleteAllData({state}) {
      for (const el of state.filters)
        fire.collection('filters').doc(el.id).delete()
      fire.collection('filtersOrder').doc(uid()).delete()
    },
  }
}
