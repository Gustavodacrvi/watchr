
import { fire, auth } from './index'
import utils from '../utils'


export default {
  namespaced: true,
  state: {
    tags: [],
    tagsOrder: [],
  },
  getters: {
    sortedTags(state) {
      const {tagsOrder, tags} = state
      return utils.checkMissingIdsAndSortArr(tagsOrder, tags)
    }
  },
  actions: {
    getData({state}) {
      const id = auth.currentUser.uid
      return Promise.all([
        new Promise(resolve => {
          fire.collection('tags').where('userId', '==', id).onSnapshot(snap => {
            utils.getDataFromFirestoreSnapshot(state, snap.docChanges(), 'tags')
            resolve()
          })
        }),
        new Promise(resolve => {
          fire.collection('tagsOrder').doc(id).onSnapshot(snap => {
            state.tagsOrder = snap.data().order
          })
        })
      ])
    },
    addTag({}, {name}) {
      return fire.collection('tags').add({
        name,
        userId: auth.currentUser.uid,
        times: 0,
      })
    },
    deleteTag({}, id) {
      return fire.collection('tags').doc(id).delete()
    },
    editTag({}, {name, id}) {
      return fire.collection('tags').doc(id).update({
        name,
      })
    },
    addDefaultData({}, id) {
      return fire.collection('tagsOrder').doc(id).set({
        order: [],
        userId: id,
      })
    }
  },
}

