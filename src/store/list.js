
import { fire, auth } from './index'
import utils from '../utils'

const uid = () => {
  return auth.currentUser.uid
}

export default {
  namespaced: true,
  state: {
    folders: [],
    lists: [],
    foldersOrder: [],
  },
  getters: {
    sortedFolders(state) {
      const {foldersOrder, folders} = state
      return utils.checkMissingIdsAndSortArr(foldersOrder, folders)
    },
  },
  actions: {
    getData({state}) {
      return Promise.all([
        new Promise(resolve => {
          fire.collection('folders').where('userId', '==', uid()).onSnapshot(snap => {
            utils.getDataFromFirestoreSnapshot(state, snap.docChanges(), 'folders')
            resolve()
          })
        }),
        new Promise(resolve => {
          fire.collection('lists').where('userId', '==', uid()).onSnapshot(snap => {
            utils.getDataFromFirestoreSnapshot(state, snap.docChanges(), 'lists')
            resolve()
          })
        }),
        new Promise(resolve => {
          fire.collection('foldersOrder').doc(uid()).onSnapshot((snap => {
            state.foldersOrder = snap.data().order
            resolve()
          }))
        })
      ])
    }
  },
}
