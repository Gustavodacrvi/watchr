
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
    ...MemoizeGetters('folders', {
      getFolderTaskOrderById({state, getters}, folderId) {
        const fold = getters.folders.find(f => f.id === folderId)
        if (fold && fold.tasks)
          return fold.tasks
        return []
      },
      getListsByFolderId: {
        react: [
          'order'
        ],
        getter({state, getters, rootGetters}, {id, lists}) {
          const arr = []
          const fold = getters.folders.find(f => f.id === id)
          for (const l of lists)
            if (l.folder && l.folder === id) arr.push(l)
          let order = fold.order
          if (!order) order = []
          return rootGetters.checkMissingIdsAndSortArr(order, arr)
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
    addFolder(c, fold) {
      const b = fire.batch()
      
      setFolder(b, {
        tasks: [],
        files: [],
        createdFire: serverTimestamp(),
        created: mom().format('Y-M-D HH:mm ss'),
        ...fold,
        defaultShowing: true,
      }, folderRef())

      b.commit()
    },
    updateFoldersOrder(c, ids) {
      const b = fire.batch()
      
      setInfo(b, {
        folders: ids,
      })

      b.commit()
    },
    updateOrder(c, {id, ids}) {
      const b = fire.batch()
      
      setFolder(b, {
        order: ids,
      }, folderRef(id))

      b.commit()
    },
    saveFolder(c, fold) {
      const b = fire.batch()
      
      setFolder(b, fold, folderRef(fold.id))

      b.commit()
    },
    moveListToRoot(c, {id, ids}) {
      const b = fire.batch()

      const writes = []

      setInfo(b, {lists: ids}, writes)
      setList(b, {folder: null}, listRef(id), writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },
    moveListBetweenFolders(c, {folder, id, ids}) {
      const b = fire.batch()

      const writes = []

      setFolder(b, {order: ids}, folderRef(folder), writes)
      setList(b, {folder}, listRef(id), writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },
    moveTasksToFolder({getters}, {ids, taskIds, folderId, smartView}) {
      const fold = getters.getFoldersById([folderId])[0]
      const b = fire.batch()

      let views = fold.smartViewsOrders
      if (!views) views = {}
      views[smartView] = ids

      const writes = []

      batchSetTasks(b, {
        list: null,
        folder: folderId,
        heading: null,
      }, taskIds, writes)

      setFolder(b, {
        smartViewsOrders: views,
      }, folderRef(folderId), writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },
    moveTasksToFolderCalendarOrder({rootState}, {ids, taskIds, date, folderId}) {
      const b = fire.batch()

      const writes = []
      
      batchSetTasks(b, {
        folder: folderId,
        list: null,
        heading: null,
      }, taskIds, writes)

      const calendarOrders = utilsTask.getUpdatedCalendarOrders(ids, date, rootState)
      
      setInfo(b, {calendarOrders}, writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },
    async addTaskByIndex(c, {ids, index, task, folderId, newTaskRef}) {
      const b = fire.batch()

      const writes = []

      await setTask(b, {
        userId: uid(),
        ...task,
      }, newTaskRef, writes)
      ids.splice(index, 0, newTaskRef.id)
      setFolder(b, {tasks: ids}, folderRef(folderId), writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },
    deleteFolderById({getters}, {id, lists, tasks}) {
      const b = fire.batch()

      const folderLists = getters.getListsByFolderId({id, lists})
      const folderTasks = tasks.filter(t => t.folder === id)

      const writes = []
      
      batchSetLists(b, {
        folder: null,
      }, folderLists.map(el => el.id), writes)

      batchSetTasks(b, {
        folder: null,
      }, folderTasks.map(el => el.id), writes)
    
      deleteFolder(b, id, writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },
    saveSmartViewHeadingTasksOrder({getters}, {ids, folderId, smartView}) {
      const folder = getters.getFoldersById([folderId])[0]
      let views = folder.smartViewsOrders
      if (!views) views = {}
      views[smartView] = ids

      const batch = fire.batch()

      setFolder(batch, {smartViewsOrders: views}, folderRef(folderId))

      batch.commit()
    },
  },
}
