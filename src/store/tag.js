
import { fire, auth } from './index'
import utils from '../utils'
import MemoizeGetters from './memoFunctionGetters'
import { tagColl, tagRef, userRef, fd, taskRef, serverTimestamp, addTask } from '../utils/firestore'
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
    rootTags(state) {
      return state.tags.filter(tag => !tag.parent && (tag.level === undefined || tag.level === 0))
    },
    sortedTags(state, getters, {userInfo}, rootGetters) {
      if (userInfo)
        return rootGetters.checkMissingIdsAndSortArr(userInfo.tags, getters.rootTags)
      return []
    },
    sortedTagsByName(s, getters) {
      const tags = getters.sortedTags
      tags.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
      return tags
    },
    ...MemoizeGetters(['tags'], {
      getSubTagsByLevel({state, getters}, level) {
        if (level === 0)
          return getters.rootTags
        return state.tags.filter(tag => tag.level === level)
      },
      getSubTagsByParentId({getters}, {parentId, level}) {
        if (!parentId)
          return getters.getSubTagsByLevel(0)
        return getters.getSubTagsByLevel(level).filter(tag => tag.parent === parentId)
      },
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
    }),
    getFavoriteTags(state) {
      return state.tags.filter(el => el.favorite).map(f => ({...f, icon: 'tag', color: 'var(--red)'}))
    },
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
    addTag(c, {name, index, ids, level, parent}) {
      if (level === undefined) level = 0
      if (!parent) parent = null
      console.log(name, index, ids, level, parent)
      const obj = {
        createdFire: serverTimestamp(),
        created: mom().format('Y-M-D HH:mm ss'),
        name,
        userId: uid(),
        level, parent,
      }
      if (index === undefined)
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
    saveTag(c, tag) {
      tagRef(tag.id).set({
        ...tag
      }, {merge: true})
    },
    addTaskByIndex(c, {ids, index, task, tagId, newTaskRef}) {
      const batch = fire.batch()
      addTask(batch, {
        createdFire: serverTimestamp(),
        created: mom().format('Y-M-D HH:mm ss'),
        userId: uid(),
        ...task,
      }, newTaskRef).then(() => {
        ids.splice(index, 0, newTaskRef.id)
  
        batch.update(tagRef(tagId), {tasks: ids})
  
        batch.commit()
      })
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
    deleteAllData({state}) {
      for (const el of state.tags)
        fire.collection('tags').doc(el.id).delete()
      fire.collection('tagsOrder').doc(uid()).delete()
    },
  },
}

