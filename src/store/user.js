
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
    recentUsersStr(state) {
      if (!state.userInfo.recentUsers) return []
      return Object.values(state.userInfo.recentUsers).map(user => {
        let str = ''
        if (user.displayName) str += user.displayName + ' '
        str += user.email
        return str
      })
    },
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
    update(c, info) {
      fire.collection('users').doc(uid()).update({
        ...info,
      })
    },
    addDefaultData(s, {user, username}) {
      fire.collection('users').doc(user.uid).set({
        userId: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        photo: user.photoURL,
        displayName: username,
      })
    },
    addRecentCollaborators(s, user) {
      fire.collection('users').doc(uid()).update({
        recentUsers: {[user.userId]: user},
      })
    },
    deleteAllData() {
      fire.collection('users').doc(uid()).delete()
    },
  },
}
