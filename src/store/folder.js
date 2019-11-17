
import { fire, auth } from './index'
import fb from 'firebase/app'

import utils from '../utils'
import { folderColl, uid } from '../utils/firestore'

export default {
  namespaced: true,
  state: {
    folders: []
  },
  getters: {

  },
  actions: {
    getData({state}) {
      return new Promise(solve => {
        folderColl().where('userId', '==', uid()).onSnapshot(snap => {
          utils.getDataFromFirestoreSnapshot(state, snap.docChanges(), 'folders')
          solve()
        })
      })
    },
  },
}
