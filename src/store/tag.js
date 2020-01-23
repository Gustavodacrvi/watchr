
import { fire, auth } from './index'
import utils from '../utils'
import MemoizeGetters from './memoFunctionGetters'
import { tagColl, tagRef, userRef, fd, taskRef, serverTimestamp, cacheRef, addTask } from '../utils/firestore'
import mom from 'moment'

const uid = () => {
  return auth.currentUser.uid
}

export default {
  namespaced: true,
  state: {
    tags: {},
  },
  getters: {
    tags(state) {
      const keys = Object.keys(state.tags).filter(k => state.tags[k])
      return keys.map(k => state.tags[k])
    },
    rootTags(state, getters) {
      return getters.tags.filter(tag => !tag.parent)
    },
    sortedTags(state, g, {userInfo}, rootGetters) {
      if (userInfo)
        return rootGetters.checkMissingIdsAndSortArr(userInfo.tags, g.tags)
      return []
    },
    sortedRootTags(state, getters, {userInfo}, rootGetters) {
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
          return getters.tags.filter(tag => tag.parent === parentId)
        },
      },
      getSubTagsByTagId({state, getters}, id) {
        const walk = (parent, tags = []) => {
          const childs = getters.tags.filter(tag => tag.parent === parent)
          tags.push(childs)
          for (const tag of childs) walk(tag.id, tags)
          return tags
        }
        return walk(id).flat(Infinity)
      },
      getTagsByName: {
        react: [
          'name',
        ],
        getter({state, getters}, names) {
          const arr = []
          for (const n of names) {
            const tag = getters.tags.find(el => el.name === n)
            if (tag) arr.push(tag)
          }
          return arr
        },
      },
      getTagsById({state, getters}, ids) {
        const arr = []
        for (const id of ids) {
          const tag = getters.tags.find(el => el.id === id)
          if (tag) arr.push(tag)
        }
        return arr
      },
    }, true),
    getFavoriteTags(state, getters) {
      return getters.tags.filter(el => el.favorite).map(f => ({...f, icon: 'tag', color: 'var(--red)'}))
    },
  },
  actions: {
/*     getData({state}) {
      if (uid())
      return Promise.all([
        new Promise(resolve => {
          tagColl().where('userId', '==', uid()).onSnapshot(snap => {
            utils.getDataFromFirestoreSnapshot(state, snap.docChanges(), 'tags')
            resolve()
          })
        })
      ])
    }, */
    addTag(c, {name, index, ids, parent}) {
      if (!parent) parent = null
      const obj = {
        createdFire: serverTimestamp(),
        created: mom().format('Y-M-D HH:mm ss'),
        name,
        userId: uid(),
        parent,
        from: 'watchr_web_app',
      }
      if (index === undefined) {
        const batch = fire.batch()
        
        const ref = tagRef()
        batch.set(ref, obj)
        batch.set(cacheRef(), {
          tags: {
            [ref.id]: obj,
          },
        }, {merge: true})
        
        batch.commit()
      } else if (!parent) {
        const batch = fire.batch()
  
        const ord = ids.slice()
        const ref = tagRef()
        batch.set(ref, obj)
        batch.set(cacheRef(), {
          tags: {
            [ref.id]: obj,
          },
        }, {merge: true})
        
        ord.splice(index, 0, ref.id)
        batch.update(userRef(), {
          tags: ord,
        })
  
        batch.commit()
      } else {
        const batch = fire.batch()

        const order = ids.slice()
        order.splice(index, 0, ref.id)
        const ref = tagRef()
        const parRef = tagRef(parent)
        const parObj = {
          order,
        }

        batch.set(ref, obj)

        batch.update(parRef, parObj)
        batch.set(cacheRef(), {
          tags: {
            [ref.id]: obj,
            [parRef.id]: parObj,
          },
        }, {merge: true})

        batch.commit()
      }
    },
    saveTag({commit}, tag) {
      const batch = fire.batch()

      const ref = tagRef(tag.id)
      const obj = {
        ...tag,
        from: 'watchr_web_app',
      }
      
      batch.set(ref, obj)
      commit('change', [ref.id], {root: true})
      batch.set(cacheRef(), {
        tags: {
          [ref.id]: obj,
        },
      }, {merge: true})

      batch.commit()
    },
    moveTagBetweenTags({}, {tagId, ids, parent}) {
      const batch = fire.batch()

      const parRef = tagRef(parent)
      const tarRef = tagRef(tagId)

      const parObj = {
        order: ids,
        from: 'watchr_web_app',
      }
      const tarObj = {
        parent,
        from: 'watchr_web_app',
      }

      batch.set(parRef, parObj, {merge: true})
      batch.set(tarRef, tarObj, {merge: true})
      commit('change', [parRef.id, tarRef.id], {root: true})
      batch.set(cacheRef(), {
        tags: {
          [parRef.id]: parObj,
          [tarRef.id]: tarObj,
        },
      }, {merge: true})

      batch.commit()
    },
    moveTagToRoot({}, {tagId, ids}) {
      const batch = fire.batch()

      const ref = tagRef(tagId)
      const obj = {
        parent: null,
        from: 'watchr_web_app',
      }
      
      batch.set(ref, obj, {merge: true})
      commit('change', [ref.id], {root: true})
      batch.set(cacheRef(), {
        tags: {
          [ref.id]: obj,
        },
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

        const ref = tagRef(tagId)
        const obj = {
          tasks: ids,
          from: 'watchr_web_app',
        }
  
        batch.set(ref, obj, {merge: true})
        commit('change', [ref.id], {root: true})
        batch.set(cacheRef(), {
          tags: {
            [ref.id]: obj,
          },
        }, {merge: true})
  
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
      batch.set(cacheRef(), {
        tags: {
          [ref.id]: fd().delete(),
        },
      }, {merge: true})
      
      batch.commit()
    },
    moveTagBelow({}, {tagId, target}) {
      const batch = fire.batch()
      
      const ref = tagRef(tagId)
      const obj = {
        parent: target,
        from: 'watchr_web_app',
      }
      
      batch.set(ref, obj, {merge: true})
      batch.set(cacheRef(), {
        tags: {
          [ref.id]: obj,
        },
      }, {merge: true})

      batch.commit()
    },
    updateOrder(c, ids) {
      userRef().update({
        tags: ids,
      })
    },
    sortTagsByName({state, getters, dispatch}) {
      const tags = getters.tags.slice()
      tags.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
      dispatch('updateOrder', tags.map(el => el.id))
    },
  },
}

