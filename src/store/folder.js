
import { fire, auth } from './index'
import fb from 'firebase/app'

import utils from '../utils'
import utilsTask from '../utils/task'
import MemoizeGetters from './memoFunctionGetters'
import { folderColl, uid, folderRef, deleteFolder, setFolder, serverTimestamp, listRef, setInfo, taskRef, setTask, batchSetLists,setList, cacheBatchedItems, batchSetTasks } from '../utils/firestore'
import mom from 'moment'

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
    ...MemoizeGetters('folders', {
      getFolderTaskOrderById({state, getters}, folderId) {
        const fold = getters.folders.find(f => f.id === folderId)
        if (fold && fold.tasks)
          return fold.tasks
        return []
      },
      getListsByFolderId: {
        react: [
          'order',
        ],
        getter({getters, rootGetters}, {id, lists}) {
          const fold = getters.folders.find(f => f.id === id)
          const arr = []
          for (const l of lists)
            if (l.folder && l.folder === id) arr.push(l)
          let order = fold.order
          if (!order) order = []
          return rootGetters.checkMissingIdsAndSortArr(order, arr)
        },
        cache(args) {
          return JSON.stringify({
            f: args[0].id,
            l: args[0].lists.map(el => ({
              i: el.id,
              f: el.folder,
              u: el.userId,
            }))
          })
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
    }, true),
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
        createdFire: serverTimestamp(),
        created: mom().format('Y-M-D HH:mm ss'),
        ...fold,
        defaultShowing: true,
      }, undefined, rootState)

      b.commit()
    },
    updateFoldersOrder(c, ids) {
      const b = fire.batch()
      
      setInfo(b, {
        folders: ids,
      })

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
      
      setFolder(b, fold, fold.id, rootState)

      b.commit()
    },
    moveListToRoot({rootState}, {id, ids}) {
      const b = fire.batch()

      const writes = []

      setInfo(b, {lists: ids}, writes)
      setList(b, {folder: null, group: null,}, id, rootState, writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },
    moveListBetweenFolders({rootState}, {folder, id, ids}) {
      const b = fire.batch()

      const writes = []

      setFolder(b, {order: ids}, folder, rootState, writes)
      setList(b, {folder, group: null}, id, rootState, writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },
    moveTasksToFolder({getters, rootState}, {ids, taskIds, folderId, smartView}) {
      const fold = getters.getFoldersById([folderId])[0]
      const b = fire.batch()

      let views = fold.smartViewsOrders
      if (!views) views = {}
      views[smartView] = ids

      const writes = []

      batchSetTasks(b, {
        list: null,
        folder: folderId,
        group: null,
        heading: null,
      }, taskIds, rootState, writes)

      setFolder(b, {
        smartViewsOrders: views,
      }, folderId, rootState, writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },
    moveTasksToFolderCalendarOrder({rootState}, {ids, taskIds, date, folderId}) {
      const b = fire.batch()

      const writes = []
      
      batchSetTasks(b, {
        folder: folderId,
        list: null,
        group: null,
        heading: null,
      }, taskIds, rootState, writes)

      const calendarOrders = utilsTask.getUpdatedCalendarOrders(ids, date, rootState)
      
      setInfo(b, {calendarOrders}, writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },
    async addTaskByIndex({rootState}, {ids, index, task, folderId, newTaskRef}) {
      const b = fire.batch()

      const writes = []

      await setTask(b, {
        userId: uid(),
        ...task,
      }, rootState, newTaskRef.id, writes)
      ids.splice(index, 0, newTaskRef.id)
      setFolder(b, {tasks: ids}, folderId, rootState, writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },
    deleteFolderById({getters, rootState}, {id, lists, tasks}) {
      const b = fire.batch()

      const folderLists = getters.getListsByFolderId({id, lists})
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
    saveSmartViewHeadingTasksOrder({getters, rootState}, {ids, folderId, smartView}) {
      const folder = getters.getFoldersById([folderId])[0]
      let views = folder.smartViewsOrders
      if (!views) views = {}
      views[smartView] = ids

      const batch = fire.batch()

      setFolder(batch, {smartViewsOrders: views}, folderId, rootState)

      batch.commit()
    },
  },
}
