
import { fire, auth } from './index'
import utils from '../utils'
import { tagColl, tagRef, userRef, fd, taskRef } from '../utils/firestore'

const uid = () => {
  return auth.currentUser.uid
}

let storeVersion = 0

// cache
const c = func => {
  let cache = {}
  let versions = {}
  return function() {
    const key = JSON.stringify(arguments)
    const val = cache[key]
    const vers = versions[key]
    if (val) {
      if (vers === storeVersion) {
        return val
      } else {
        cache = {}
        versions = {}
      }
    }

    const res = func.apply(null, arguments)
    cache[key] = res
    versions[key] = storeVersion
    return res
  }
}

export default {
  namespaced: true,
  state: {
    tags: [],
  },
  getters: {
    sortedTags(state, asd, {userInfo}) {
      const {tags} = state
      if (userInfo)
        return utils.checkMissingIdsAndSortArr(userInfo.tags, tags)
      return []
    },
    sortedTagsByFrequency(s, getters) {
      const tags = getters.sortedTags
      tags.sort((a, b) => b.times - a.times)
      return tags
    },
    getTagsByName: state => c(names => {
      const arr = []
      for (const n of names) {
        const tag = state.tags.find(el => el.name === n)
        if (tag) arr.push(tag)
      }
      return arr
    }),
    getTagsById: state => c(ids => {
      const arr = []
      for (const id of ids) {
        const tag = state.tags.find(el => el.id === id)
        if (tag) arr.push(tag)
      }
      return arr
    }),
  },
  actions: {
    getData({state}) {
      if (uid())
      return Promise.all([
        new Promise(resolve => {
          tagColl().where('userId', '==', uid()).onSnapshot(snap => {
            storeVersion++
            utils.getDataFromFirestoreSnapshot(state, snap.docChanges(), 'tags')
            resolve()
          })
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
        tagColl().add(obj)
      else {
        const batch = fire.batch()
  
        const ord = ids.slice()
        const ref = tagRef()
        batch.set(ref, obj)
        ord.splice(index, 0, ref.id)
        const user = userRef()
        batch.update(user, {
          tags: ord,
        })
  
        batch.commit()
      }
    },
    deleteTag(c, {id, tasks}) {
      const batch = fire.batch()
      const ts = tasks.filter(t => t.tags.includes(id))
      
      for (const t of ts) {
        const ref = taskRef(t.id)
        batch.update(ref, {
          tags: fd().arrayRemove(id)
        })
      }

      const ref = tagRef(id)
      batch.delete(ref)
      
      batch.commit()
    },
    updateOrder(c, ids) {
      userRef().update({
        tags: ids,
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
      tagRef(tag.id).update({
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

