
import { fire, auth } from './index'
import fb from 'firebase/app'

import utils from '../utils'
import { folderColl, uid, folderRef, listRef, userRef, taskRef, addTask } from '../utils/firestore'

let storeVersion = 0

// cache
const c = func => {
  let cache = {}
  let versions = {}
  return function() {
    const key = JSON.stringify(arguments)
    const val = cache[key]
    const vers = versions[key]
    if (val) {
      if (vers === storeVersion) {
        return val
      } else {
        cache = {}
        versions = {}
      }
    }

    const res = func.apply(null, arguments)
    cache[key] = res
    versions[key] = storeVersion
    return res
  }
}

export default {
  namespaced: true,
  state: {
    folders: []
  },
  getters: {
    sortedFolders(state, d, {userInfo}) {
      const {folders} = state
      let order = userInfo.folders
      if (!order) order = []
      if (userInfo)
        return utils.checkMissingIdsAndSortArr(order, folders)
      return []
    },
    getFolderTaskOrderById: state => c(folderId => {
      const fold = state.folders.find(f => f.id === folderId)
      if (fold && fold.tasks)
        return fold.tasks
      return []
    }),
    getListsByFolderId: state => c(({id, lists}) => {
      const arr = []
      const fold = state.folders.find(f => f.id === id)
      for (const l of lists)
        if (l.folder && l.folder === id) arr.push(l)
      let order = fold.order
      if (!order) order = []
      return utils.checkMissingIdsAndSortArr(order, arr)
    }),
    getFoldersByName: state => c(names => {
      const arr = []
      for (const n of names) {
        const fold = state.folders.find(f => f.name === n)
        if (fold) arr.push(fold)
      }
      return arr
    }),
    getFoldersById: state => c(ids => {
      const arr = []
      for (const f of state.folders)
        if (ids.includes(f.id)) arr.push(f)
      return arr
    }),
  },
  actions: {
    getData({state}) {
      return new Promise(solve => {
        folderColl().where('userId', '==', uid()).onSnapshot(snap => {
          storeVersion++
          utils.getDataFromFirestoreSnapshot(state, snap.docChanges(), 'folders')
          solve()
        })
      })
    },
    addFolder(c, fold) {
      folderRef().set({
        userId: uid(),
        ...fold,
        defaultShowing: true,
      })
    },
    updateFoldersOrder(c, ids) {
      userRef(uid()).update({
        folders: ids,
      })
    },
    updateOrder(c, {id, ids}) {
      folderRef(id).update({
        order: ids,
      })
    },
    saveFolder(c, fold) {
      console.log(fold.tasks)
      folderRef(fold.id).update({
        ...fold, 
      })
    },
    moveListToRoot(c, {id, ids}) {
      const batch = fire.batch()

      batch.update(userRef(uid()), {lists: ids})
      batch.update(listRef(id), {folder: null})

      batch.commit()
    },
    moveTasksToFolder({getters}, {ids, taskIds, folderId, smartView}) {
      const fold = getters.getFoldersById([folderId])[0]
      const batch = fire.batch()

      let views = fold.smartViewsOrders
      if (!views) views = {}
      views[smartView] = ids

      for (const id of taskIds) {
        batch.update(taskRef(id), {
          list: null,
          folder: folderId,
          heading: null,
        })
      }
      batch.update(folderRef(folderId), {
        smartViewsOrders: views,
      })

      batch.commit()
    },
    addTaskByIndex(c, {ids, index, task, folderId}) {
      const batch = fire.batch()

      const newTaskRef = taskRef()
      addTask(batch, {
        userId: uid(),
        ...task,
      }, newTaskRef).then(() => {
        ids.splice(index, 0, newTaskRef.id)
  
        batch.update(folderRef(folderId), {tasks: ids})
  
        batch.commit()
      })
    },
    moveListBetweenFolders(c, {folder, id, ids}) {
      const batch = fire.batch()

      batch.update(folderRef(folder), {order: ids})
      batch.update(listRef(id), {folder})

      batch.commit()
    },
    deleteFolderById({getters}, {id, lists, tasks}) {
      const batch = fire.batch()

      const folderLists = getters.getListsByFolderId({id, lists})
      for (const l of folderLists)
        batch.update(listRef(l.id), {
          folder: null,
        })
      for (const t of tasks)
        batch.update(taskRef(t.id), {
          folder: null,
        })
      
      batch.delete(folderRef(id))

      batch.commit()
    },
    saveSmartViewHeadingTasksOrder({getters}, {ids, folderId, smartView}) {
      const folder = getters.getFoldersById([folderId])[0]
      let views = folder.smartViewsOrders
      if (!views) views = {}
      views[smartView] = ids
      folderRef(folderId).update({
        smartViewsOrders: views,
      })
    },
  },
}
