
import { fire, auth } from './index'
import fb from 'firebase/app'

import utils from '../utils'
import MemoizeGetters from './memoFunctionGetters'
import { pomoColl, uid } from '../utils/firestore'
import mom from 'moment/src/moment'

export default {
  namespaced: true,
  state: {
    pomos: [],
  },
  getters: {
    sortedPomos(state, d, {userInfo}, rootGetters) {
      const {pomos} = state
      let order = userInfo.pomos
      if (!order) order = []
      if (userInfo)
        return rootGetters.checkMissingIdsAndSortArr(order, pomos)
      return []
    },
  },
  actions: {
    getData({state}) {
      return new Promise(solve => {
        pomoColl().where('userId', '==', uid()).onSnapshot(snap => {
          utils.getDataFromFirestoreSnapshot(state, snap.docChanges(), 'pomos')
          solve()
        })
      })
    },
    addPomo(c, pomo) {
      pomoRef().set({ ...pomo })
    },
    updatePomosOrder(c, ids) {
      userRef(uid()).update({
        pomos: ids,
      })
    },
    savePomo(c, pomo) {
      pomoRef(pomo.id).update({
        ...pomo, 
      })
    },
    deletePomoById({}, id) {
      pomoRef(id).delete()
    },
  },
}
