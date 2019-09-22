
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
      return Promise.all([
        new Promise(resolve => {
          fire.collection('filters').where('userId', '==', uid()).onSnapshot(snap => {
            utils.getDataFromFirestoreSnapshot(state, snap.docChanges(), 'filters')
            resolve()
          })
        }),
        new Promise(resolve => {
          fire.collection('filtersOrder').doc(uid()).onSnapshot(snap => {
            state.filtersOrder = snap.data().order
            resolve()
          })
        })
      ])
    }
  }
}
