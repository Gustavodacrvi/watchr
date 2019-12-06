
import { fire, auth } from './index'
import utils from '../utils'
import MemoizeGetters from './memoFunctionGetters'
import { tagColl, tagRef, userRef, fd, taskRef, serverTimestamp } from '../utils/firestore'
import mom from 'moment/src/moment'

const uid = () => {
  return auth.currentUser.uid
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
    sortedTagsByName(s, getters) {
      const tags = getters.sortedTags
      tags.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
      return tags
    },
    ...MemoizeGetters(['tags'], {
      getTagsByName({state}, names) {
        const arr = []
        for (const n of names) {
          const tag = state.tags.find(el => el.name === n)
          if (tag) arr.push(tag)
        }
        return arr
      },
      getTagsById({state}, ids) {
        const arr = []
        for (const id of ids) {
          const tag = state.tags.find(el => el.id === id)
          if (tag) arr.push(tag)
        }
        return arr
      },
    })
  },
  actions: {
    getData({state}) {
      if (uid())
      return Promise.all([
        new Promise(resolve => {
          tagColl().where('userId', '==', uid()).onSnapshot(snap => {
            utils.getDataFromFirestoreSnapshot(state, snap.docChanges(), 'tags')
            resolve()
          })
        })
      ])
    },
    addTag(c, {name, index, ids}) {
      const obj = {
        createdFire: serverTimestamp(),
        created: mom().format('Y-M-D HH:mm ss'),
        name,
        userId: uid(),
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

