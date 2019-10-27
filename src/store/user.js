
import { fire, auth } from './index'
import fb from 'firebase/app'

import utils from '../utils'
import utilsTask from '../utils/task'

const uid = () => auth.currentUser.uid
const fd = () => fb.firestore.FieldValue

export default {
  namespaced: true,
  state: {
    userInfo: null,
  },
  getters: {

  },
  actions: {
    getData({state}) {
      return new Promise(resolve => {
        fire.collection('users').doc(uid()).onSnapshot(snap => {
          state.userInfo = snap.data()
          resolve()
        })
      })
    },
    addDefaultData(s, id) {
      fire.collection('users').doc(id).set({
        userId: id,
      })
    },
    deleteAllData() {
      fire.collection('users').doc(uid()).delete()
    },
  },
}
