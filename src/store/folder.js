
import { fire, auth } from './index'
import fb from 'firebase/app'

import utils from '../utils'
import utilsTask from '../utils/task'
import utilsList from '../utils/list'
import MemoizeGetters from './memoFunctionGetters'
import { uid, deleteFolder, setFolder, setInfo, setTask, batchSetLists,setList, cacheBatchedItems, batchSetTasks } from '../utils/firestore'
import mom from 'moment'

const TOD_DATE = mom().format('Y-M-D')

export default {
  namespaced: true,
  state: {
    folders: {},
  },
  getters: {
    folders(state) {
      const keys = Object.keys(state.folders).filter(k => state.folders[k])
      return keys.map(k => state.folders[k])
    },
    sortedFolders(state, d, {userInfo}, rootGetters) {
      let order = userInfo.folders
      if (!order) order = []
      if (userInfo)
        return rootGetters.checkMissingIdsAndSortArr(order, d.folders)
      return []
    },
    sortedFoldersByName(s, getters) {
      const folders = getters.folders.slice()
      folders.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
      return folders
    },
    sortedFoldersAndGroups(s, d, state, rootGetters) {
      const {userInfo} = state
      let order = userInfo.folders
      if (!order) order = []

      const groups = state.group.groups
      const folders = d.folders

      groups.forEach(el => el.isGroup = true)
      
      if (userInfo)
        return rootGetters.checkMissingIdsAndSortArr(order, [
          ...folders,
          ...groups,
        ])
      return []
    },
    ...MemoizeGetters({
      getFolderTaskOrderById: {
        deepGetterTouch: {
          'folder/folders': [
            'tasks'
          ]
        },
        getter({}, folderId) {
          const fold = this['folder/folders'].find(f => f.id === folderId)
          if (fold && fold.tasks)
            return fold.tasks
          return []
        },
        cache(args) {
          return args[0]
        },
      },
      getListsByFolderId: {
        deepGetterTouch: {
          'folder/sortedFolders': [
            'order'
          ],
          'list/lists': [
            'completed',
            'canceled',
            'folder',
            'calendar',
            'group',
            'assigned',
          ]
        },
        getter({rootGetters}, id) {
          const fold = this['folder/sortedFolders'].find(f => f.id === id)
          const arr = []
          const lists = utilsList.filterSidebarLists(rootGetters, this['list/lists'], TOD_DATE)
          for (const l of lists)
            if (l.folder && l.folder === id) arr.push(l)
          let order = fold.order
          if (!order) order = []
          return rootGetters.checkMissingIdsAndSortArr(order, arr)
        },
        cache(args) {
          return args[0]
        },
      },
      getFoldersByName: {
        react: [
          'name',
        ],
        getter({state, getters}, names) {
          const arr = []
          for (const n of names) {
            const fold = getters.folders.find(f => f.name === n)
            if (fold) arr.push(fold)
          }
          return arr
        },
      },
      getFoldersById({state, getters}, ids) {
        const arr = []
        for (const f of getters.folders)
          if (ids.includes(f.id)) arr.push(f)
        return arr
      },
    }),
    getFavoriteFolders(state, getters) {
      return getters.folders.filter(f => f.favorite).map(f => ({...f, icon: 'folder', color: 'var(--txt)'}))
    },
  },
  actions: {
    addFolder({rootState}, fold) {
      const b = fire.batch()
      
      setFolder(b, {
        tasks: [],
        files: [],
        createdFire: new Date(),
        created: mom().format('Y-M-D HH:mm ss'),
        ...fold,
        defaultShowing: true,
      }, undefined, rootState)

      b.commit()
    },
    updateFoldersOrder({rootState}, ids) {
      const b = fire.batch()
      
      setInfo(b, {
        folders: ids,
      }, rootState)

      b.commit()
    },
    updateOrder({rootState}, {id, ids}) {
      const b = fire.batch()
      
      setFolder(b, {
        order: ids,
      }, id, rootState)

      b.commit()
    },
    saveFolder({rootState}, fold) {
      const b = fire.batch()

      if (fold.comp)
        delete fold.comp

      setFolder(b, fold, fold.id, rootState)

      b.commit()
    },
    moveListToRoot({rootState}, {itemIds, ids}) {
      const b = fire.batch()

      const writes = []

      setInfo(b, {lists: ids}, rootState, writes)
      
      batchSetLists(b, {
        folder: null,
        group: null,
      }, itemIds, rootState, writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },
    moveListBetweenFolders({rootState}, {folder, itemIds, ids}) {
      const b = fire.batch()

      const writes = []

      setFolder(b, {order: ids}, folder, rootState, writes)
      batchSetLists(b, {
        folder, group: null,
      }, itemIds, rootState, writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },
    deleteFolderById({getters, rootState}, {id, lists, tasks}) {
      const b = fire.batch()

      const folderLists = getters.getListsByFolderId(id)
      const folderTasks = tasks.filter(t => t.folder === id)

      const writes = []
      
      batchSetLists(b, {
        folder: null,
        group: null,
      }, folderLists.map(el => el.id), rootState, writes)
      
      batchSetTasks(b, {
        folder: null,
        group: null,
      }, folderTasks.map(el => el.id), rootState, writes)
    
      deleteFolder(b, id, rootState, writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },
  },
}
