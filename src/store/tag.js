
import { fire, auth } from './index'
import utils from '../utils'

const uid = () => {
  return auth.currentUser.uid
}

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
      return Promise.all([
        new Promise(resolve => {
          fire.collection('tags').where('userId', '==', uid()).onSnapshot(snap => {
            utils.getDataFromFirestoreSnapshot(state, snap.docChanges(), 'tags')
            resolve()
          })
        }),
        new Promise(resolve => {
          fire.collection('tagsOrder').doc(uid()).onSnapshot(snap => {
            state.tagsOrder = snap.data().order
            resolve()
          })
        })
      ])
    },
    addTag(c, {name}) {
      return fire.collection('tags').add({
        name,
        userId: uid(),
        times: 0,
      })
    },
    deleteTag(c, id) {
      return fire.collection('tags').doc(id).delete()
    },
    updateOrder(c, ids) {
      return fire.collection('tagsOrder').doc(uid()).update({
        order: ids,
      })
    },
    sortTagsByFrequency({state, dispatch}) {
      const tags = state.tags.slice()
      tags.sort((a, b) => b.times - a.times)
      dispatch('updateOrder', tags.map(el => el.id))
    },
    sortTagsByName({state, dispatch}) {
      const tags = state.tags.slice()
      tags.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
      dispatch('updateOrder', tags.map(el => el.id))
    },
    editTag(c, {name, id}) {
      return fire.collection('tags').doc(id).update({
        name,
      })
    },
    addDefaultData(c, id) {
      return fire.collection('tagsOrder').doc(id).set({
        order: [],
        userId: id,
      })
    }
  },
}

