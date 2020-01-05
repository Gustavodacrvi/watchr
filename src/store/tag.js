
import { fire, auth } from './index'
import utils from '../utils'
import MemoizeGetters from './memoFunctionGetters'
import { tagColl, tagRef, userRef, fd, taskRef, serverTimestamp, addTask } from '../utils/firestore'
import mom from 'moment'

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
      return state.tags.filter(tag => !tag.parent)
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
    ...MemoizeGetters('tags', {
      getSubTagsByParentId: {
        react: ['parent'],
        getter({state, getters}, parentId) {
          if (!parentId)
            return getters.rootTags
          return state.tags.filter(tag => tag.parent === parentId)
        },
      },
      getTagsByName: {
        react: [
          'name',
        ],
        getter({state}, names) {
          const arr = []
          for (const n of names) {
            const tag = state.tags.find(el => el.name === n)
            if (tag) arr.push(tag)
          }
          return arr
        },
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
    addTag(c, {name, index, ids, parent}) {
      if (!parent) parent = null
      const obj = {
        createdFire: serverTimestamp(),
        created: mom().format('Y-M-D HH:mm ss'),
        name,
        userId: uid(),
        parent,
      }
      if (index === undefined) {
        tagColl().add(obj)
      } else if (!parent) {
        const batch = fire.batch()
  
        const ord = ids.slice()
        const ref = tagRef()
        batch.set(ref, obj)
        ord.splice(index, 0, ref.id)
        batch.update(userRef(), {
          tags: ord,
        })
  
        batch.commit()
      } else {
        const batch = fire.batch()

        const order = ids.slice()
        const ref = tagRef()
        batch.set(ref, obj)
        order.splice(index, 0, ref.id)
        batch.update(tagRef(parent), {
          order,
        })

        batch.commit()
      }
    },
    saveTag(c, tag) {
      tagRef(tag.id).set({
        ...tag
      }, {merge: true})
    },
    moveTagBetweenTags({}, {tagId, ids, parent}) {
      const batch = fire.batch()

      batch.set(tagRef(parent), {
        order: ids,
      }, {merge: true})
      batch.set(tagRef(tagId), {
        parent,
      }, {merge: true})

      batch.commit()
    },
    moveTagToRoot({}, {tagId, ids}) {
      const batch = fire.batch()

      batch.set(tagRef(tagId), {
        parent: null,
      }, {merge: true})
      batch.update(userRef(), {
        tags: ids,
      })

      batch.commit()
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
    moveTagBelow({}, {tagId, target}) {
      tagRef(tagId).update({
        parent: target, 
      })
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

