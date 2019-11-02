
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
    sortedTagsByFrequency(s, getters) {
      const tags = getters.sortedTags
      tags.sort((a, b) => b.times - a.times)
      return tags
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
      if (uid())
      return Promise.all([
        new Promise(resolve => {
          /* fire.collection('users').doc(uid()).collection('tags').doc(uid()).onSnapshot(snap => {
            utils.getDataFromFirestoreSnapshot(state, snap.docChanges(), 'lists')
          }) */
          resolve()
        })
      ])
    },
    addTag(c, {name, index, ids}) {
      const obj = {
        name,
        userId: uid(),
        times: 0,
      }
      if (!index)
        fire.collection('tags').add(obj)
      else {
        const batch = fire.batch()
  
        const ord = ids.slice()
        const ref = fire.collection('tags').doc()
        batch.set(ref, obj)
        ord.splice(index, 0, ref.id)
        const orderRef = fire.collection('tagsOrder').doc(uid())
        batch.update(orderRef, {
          order: ord,
        })
  
        batch.commit()
      }
    },
    deleteTag(c, id) {
      fire.collection('tags').doc(id).delete()
    },
    updateOrder(c, ids) {
      fire.collection('tagsOrder').doc(uid()).update({
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
    saveTag(c, tag) {
      fire.collection('tags').doc(tag.id).update({
        ...tag
      })
    },
    deleteAllData({state}) {
      for (const el of state.tags)
        fire.collection('tags').doc(el.id).delete()
      fire.collection('tagsOrder').doc(uid()).delete()
    },
  },
}

