
import { fire, auth } from './index'
import fb from 'firebase/app'

import utils from '../utils'
import { folderColl, uid, folderRef, listRef, userRef, taskRef } from '../utils/firestore'

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
    getFolderTaskOrderById: state => folderId => {
      const fold = state.folders.find(f => f.id === folderId)
      if (fold && fold.tasks)
        return fold.tasks
      return []
    },
    getListsByFolderId: state => ({id, lists}) => {
      const arr = []
      const fold = state.folders.find(f => f.id === id)
      for (const l of lists)
        if (l.folder && l.folder === id) arr.push(l)
      let order = fold.order
      if (!order) order = []
      return utils.checkMissingIdsAndSortArr(order, arr)
    },
    getFoldersByName: state => names => {
      const arr = []
      for (const n of names) {
        const fold = state.folders.find(f => f.name === n)
        if (fold) arr.push(fold)
      }
      return arr
    },
    getFoldersById: state => ids => {
      const arr = []
      for (const f of state.folders)
        if (ids.includes(f.id)) arr.push(f)
      return arr
    },
  },
  actions: {
    getData({state}) {
      return new Promise(solve => {
        folderColl().where('userId', '==', uid()).onSnapshot(snap => {
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
    moveListBetweenFolders(c, {folder, id, ids}) {
      const batch = fire.batch()

      batch.update(folderRef(folder), {order: ids})
      batch.update(listRef(id), {folder})

      batch.commit()
    },
    deleteFolderById({getters}, {id, lists}) {
      const batch = fire.batch()

      const folderLists = getters.getListsByFolderId({id, lists})
      for (const l of folderLists)
        batch.update(listRef(l.id), {
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
