
import { fire, auth } from './index'
import utils from '../utils'

const uid = () => {
  return auth.currentUser.uid
}

export default {
  namespaced: true,
  state: {
    tags: [],
    order: [],
  },
  getters: {
    sortedTags(state) {
      const {order, tags} = state
      return utils.checkMissingIdsAndSortArr(order, tags)
    },
    getTagsByName: state => names => {
      const arr = []
      for (const n of names) {
        const tag = state.tags.find(el => el.name === n)
        if (tag) arr.push(tag)
      }
      return arr
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
            state.order = snap.data().order
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

