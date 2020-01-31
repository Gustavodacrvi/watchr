
import { fire, auth } from './index'
import utils from '../utils'
import MemoizeGetters from './memoFunctionGetters'
import { tagColl, tagRef, setInfo, fd, taskRef, setTag, serverTimestamp, cacheRef, setTask, cacheBatchedItems, deleteTag, batchSetTasks } from '../utils/firestore'
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
    addTagInRootByIndex({rootState}, {ids, item, newItemRef}) {
      const b = fire.batch()

      const writes = []

      setTag(b, item, newItemRef, rootState, writes)
      
      setInfo(b, {tags: ids}, writes)

      cacheBatchedItems(b, writes)
      
      b.commit()
    },
    addSubTagByIndex({rootState}, {ids, item, newItemRef}) {
      const b = fire.batch()
        
      const writes = []
      
      setTag(b, item, newItemRef, rootState, writes)
      
      setTag(b, {
        order: ids,
      }, tagRef(item.parent), rootState, writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },
    addTag({rootState}, {name, index, ids, parent}) {
      if (!parent) parent = null
      const obj = {
        createdFire: serverTimestamp(),
        created: mom().format('Y-M-D HH:mm ss'),
        name,
        userId: uid(),
        parent,
      }
      if (index === undefined) {
        const b = fire.batch()
        
        setTag(b, obj, tagRef(), rootState)
        
        b.commit()
      }
    },
    saveTag({commit, rootState}, tag) {
      const b = fire.batch()

      setTag(b, tag, tagRef(tag.id), rootState)
      commit('change', [tag.id], {root: true})

      b.commit()
    },
    moveTagBetweenTags({commit, rootState}, {tagId, ids, parent}) {
      const b = fire.batch()

      const writes = []

      setTag(b, {order: ids}, tagRef(parent), rootState, writes)
      setTag(b, {parent}, tagRef(tagId), rootState, writes)
      commit('change', [parent, tagId], {root: true})

      cacheBatchedItems(b, writes)

      b.commit()
    },
    moveTagToRoot({commit, rootState}, {tagId, ids}) {
      const b = fire.batch()

      const writes = []

      setTag(b, {parent: null}, tagRef(tagId), rootState, writes)
      setInfo(b, {tags: ids}, writes)
      commit('change', [tagId], {root: true})

      cacheBatchedItems(b, writes)

      b.commit()
    },
    async addTaskByIndex({commit, rootState}, {ids, index, task, tagId, newTaskRef}) {
      const b = fire.batch()

      const writes = []
      
      await setTask(b, {
        createdFire: serverTimestamp(),
        created: mom().format('Y-M-D HH:mm ss'),
        userId: uid(),
        ...task,
      }, rootState, newTaskRef, writes)

      ids.splice(index, 0, newTaskRef.id)

      setTag(b, {tasks: ids}, tagRef(tagId), rootState, writes)
      commit('change', [newTaskRef.id], {root: true})

      cacheBatchedItems(b, writes)

      b.commit()
    },
    deleteTag({rootState}, {id, tasks}) {
      const b = fire.batch()
      const ts = tasks.filter(t => t.tags && t.tags.includes(id))
      
      const writes = []
      
      batchSetTasks(b, {
        tags: fd().arrayRemove(id)
      }, ts.map(el => el.id), rootState, writes)

      deleteTag(b, id, rootState, writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },
    moveTagBelow({rootState}, {tagId, target}) {
      const b = fire.batch()
      
      setTag(b, {parent: target}, tagRef(tagId), rootState)

      b.commit()
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

