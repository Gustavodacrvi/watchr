
import { fire, auth } from './index'
import utils from '../utils'
import MemoizeGetters from './memoFunctionGetters'
import { setInfo, fd, setTag, cacheBatchedItems, deleteTag, batchSetTasks, batchSetTags } from '../utils/firestore'
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
    ...MemoizeGetters({
      getSubTagsByParentId: {
        deepGetterTouch: {
          'tag/tags': [
            'parent',
            'order',
          ]
        },
        getter({}, parentId) {
          return this['tag/tags'].filter(tag => tag.parent === parentId)
        },
        cache(args) {
          return args[0]
        },
      },
      getSubTagsByTagId: {
        deepGetterTouch: {
          'tag/tags': [
            'parent',
            'order',
          ]
        },
        getter({}, id) {
          const walk = (parent, tags = []) => {
            const childs = this['tag/tags'].filter(tag => tag.parent === parent)
            tags.push(childs)
            for (const tag of childs) walk(tag.id, tags)
            return tags
          }
          return walk(id).flat(Infinity)
        },
        cache(args) {
          return args[0]
        },
      },
      getTagsByName: {
        deepGetterTouch: {
          'tag/tags': [
            'name',
          ]
        },
        getter({}, names) {
          const arr = []
          for (const n of names) {
            const tag = this['tag/tags'].find(el => el.name === n)
            if (tag) arr.push(tag)
          }
          return arr
        },
      },
      getTagsById: {
        touchGetters: [
          'tag/tags',
        ],
        getter({}, ids) {
          const arr = []
          for (const id of ids) {
            const tag = this['tag/tags'].find(el => el.id === id)
            if (tag) arr.push(tag)
          }
          return arr
        },
      },
    }),
    getFavoriteTags(state, getters) {
      return getters.tags.filter(el => el.favorite).map(f => ({...f, icon: 'tag', color: 'var(--red)'}))
    },
  },
  actions: {
    addTagInRootByIndex({rootState}, {ids, item, newItemRef}) {
      const b = fire.batch()

      const writes = []

      setTag(b, item, newItemRef.id, rootState, writes)
      
      setInfo(b, {tags: ids}, rootState, writes)

      cacheBatchedItems(b, writes)
      
      b.commit()
    },
    addSubTagByIndex({rootState}, {ids, item, newItemRef}) {
      const b = fire.batch()
        
      const writes = []
      
      setTag(b, item, newItemRef.id, rootState, writes)
      
      setTag(b, {
        order: ids,
      }, item.parent, rootState, writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },
    addTag({rootState}, {name, index, ids, parent}) {
      if (!parent) parent = null
      const obj = {
        createdFire: new Date(),
        created: mom().format('Y-M-D HH:mm ss'),
        name,
        userId: uid(),
        parent,
      }
      if (index === undefined) {
        const b = fire.batch()
        
        setTag(b, obj, undefined, rootState)
        
        b.commit()
      }
    },
    saveTag({rootState}, tag) {
      const b = fire.batch()

      setTag(b, tag, tag.id, rootState)

      b.commit()
    },
    moveTagBetweenTags({commit, rootState}, {tagIds, ids, parent}) {
      const b = fire.batch()

      const writes = []

      setTag(b, {order: ids}, parent, rootState, writes)
      batchSetTags(b, {
        parent,
      }, tagIds, rootState, writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },
    moveTagToRoot({rootState}, {tagIds, ids}) {
      const b = fire.batch()

      const writes = []

      batchSetTags(b, {
        parent: null,
      }, tagIds, rootState, writes)
      
      setInfo(b, {tags: ids}, rootState, writes)

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
      
      setTag(b, {parent: target}, tagId, rootState)

      b.commit()
    },
    updateOrder({rootState}, ids) {
      const b = fire.batch()
      
      setInfo(b, {tags: ids}, rootState)

      b.commit()
    },
    sortTagsByName({state, getters, dispatch}) {
      const tags = getters.tags.slice()
      tags.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
      dispatch('updateOrder', tags.map(el => el.id))
    },
  },
}

