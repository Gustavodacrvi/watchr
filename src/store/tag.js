
import { fire, auth } from './index'
import utils from '../utils'
import MemoizeGetters from './memoFunctionGetters'
import { tagColl, tagRef, setInfo, fd, taskRef, setTag, serverTimestamp, cacheRef, setTask, deleteTag } from '../utils/firestore'
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
      }
      if (index === undefined) {
        const batch = fire.batch()
        
        setTag(batch, obj, tagRef())
        
        batch.commit()
      } else if (!parent) {
        const batch = fire.batch()
  
        const ord = ids.slice()
        const ref = tagRef()
        setTag(batch, obj, ref)
        
        ord.splice(index, 0, ref.id)
        setInfo(batch, {tags: ord})
        
        batch.commit()
      } else {
        const batch = fire.batch()
        
        const order = ids.slice()
        
        const ref = tagRef()
        setTag(batch, obj, ref)
        order.splice(index, 0, ref.id)
        
        setTag(batch, {
          order,
        }, tagRef(parent))

        batch.commit()
      }
    },
    saveTag({commit}, tag) {
      const batch = fire.batch()

      setTag(batch, tag, tagRef(tag.id))
      commit('change', [tag.id], {root: true})

      batch.commit()
    },
    moveTagBetweenTags({}, {tagId, ids, parent}) {
      const batch = fire.batch()

      setTag(batch, {order: ids}, tagRef(parent))
      setTag(batch, {parent}, tagRef(tagId))
      commit('change', [parent, tagId], {root: true})

      batch.commit()
    },
    moveTagToRoot({}, {tagId, ids}) {
      const batch = fire.batch()

      setTag(batch, {parent: null}, tagRef(tagId))
      commit('change', [ref.id], {root: true})
      setInfo(batch, {tags: ids})

      batch.commit()
    },
    addTaskByIndex(c, {ids, index, task, tagId, newTaskRef}) {
      const batch = fire.batch()
      setTask(batch, {
        createdFire: serverTimestamp(),
        created: mom().format('Y-M-D HH:mm ss'),
        userId: uid(),
        ...task,
      }, newTaskRef).then(() => {
        ids.splice(index, 0, newTaskRef.id)

        setTag(batch, {tasks: ids}, tagRef(tagId))
        commit('change', [ref.id], {root: true})
  
        batch.commit()
      })
    },
    deleteTag(c, {id, tasks}) {
      const batch = fire.batch()
      const ts = tasks.filter(t => t.tags.includes(id))
      
      for (const t of ts) {
        setTask(batch, {
          tags: fd().arrayRemove(id)
        }, taskRef(t.id))
      }

      deleteTag(batch, id)

      batch.commit()
    },
    moveTagBelow({}, {tagId, target}) {
      const batch = fire.batch()
      
      setTag(batch, {parent: target}, tagRef(tagId))

      batch.commit()
    },
    updateOrder(c, ids) {
      const b = fire.batch()
      
      setInfo(b, {tags: ids})

      b.commit()
    },
    sortTagsByName({state, getters, dispatch}) {
      const tags = getters.tags.slice()
      tags.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
      dispatch('updateOrder', tags.map(el => el.id))
    },
  },
}

