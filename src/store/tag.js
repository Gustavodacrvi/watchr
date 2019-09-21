
import { fire, auth } from './index'
import utils from '../utils'


export default {
  namespaced: true,
  state: {
    tags: [],
  },
  actions: {
    getData({state}) {
      return new Promise(resolve => {
        const id = auth.currentUser.uid
        fire.collection('tag').where('userId', '==', id).onSnapshot(snap => {
          utils.getDataFromFirestoreSnapshot(state, snap.docChanges(), 'tags')
          resolve()
        })
      })
    },
  },
}

