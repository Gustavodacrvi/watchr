
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
/*         fire.collection('users').doc(uid()).onSnapshot(snap => {
          state.userInfo = snap.data()
          resolve()
        }) */
        resolve()
      })
    },
    update({state}, info) {
      const batch = fire.batch()
      
      const userRef = fire.collection('users').doc(info.uid)
      batch.update(userRef, {
        ...utils.getRelevantUserData(info),
      })
/*       const yourListIds = []
      const pendingIds = []
      const sharedIds = []

      const updateOwnLists = res => {
        res.docs.forEach(list => yourListIds.push(list.id))
        for (const id of yourListIds) {
          const listRef = fire.collection('lists').doc(id)
          batch.set(listRef, {
            ownerData: {...info},
          }, {merge: true})
        }
      }
      const updateSharedLists = (pendingRes, rejectedRes, sharedRes) => {
        pendingRes.docs.forEach(list => pendingIds.push(list.id))
        rejectedRes.docs.forEach(list => pendingIds.push(list.id))
        sharedRes.docs.forEach(list => sharedIds.push(list.id))

        const allIds = [...pendingIds, ...sharedIds].filter(id => id !== uid())

        for (const id of allIds) {
          const listRef = fire.collection('lists').doc(id)
          batch.set(listRef, {
            userData: {[uid()]: {...info}},
          }, {merge: true})
        }
      }

      Promise.all([
        fire.collection('lists').where('userId', '==', uid()).get({source: 'server'}),
        fire.collection('lists').where(`pending.${uid()}`, '==', 'pending').get({source: 'server'}),
        fire.collection('lists').where(`pending.${uid()}`, '==', 'rejected').get({source: 'server'}),
        fire.collection('lists').where(`users.${uid()}`, '==', true).get({source: 'server'})
      ]).then(res => {
        updateOwnLists(res[0])
        updateSharedLists(res[1], res[2], res[3])
      }) */
      return batch.commit()
    },
    createAnonymousUser(c, userId) {
      fire.collection('users').doc(userId).set({
        ...utils.getRelevantUserData(userId),
      })
    },
    createUser(s, user) {
      fire.collection('users').doc(user.uid).set({
        ...utils.getRelevantUserData(user),
      })
    },
    addRecentCollaborators({state}, user) {
      if (!state.userInfo.recentUsers[user.userId])
        fire.collection('users').doc(uid()).update({
          recentUsers: {[user.userId]: user},
        })
    },
    deleteAllData() {
      fire.collection('users').doc(uid()).delete()
    },
  },
}
