
import { fire, auth } from './index'
import fb from 'firebase/app'

import utils from '../utils'
import { folderColl, uid, folderRef, listRef, userRef } from '../utils/firestore'

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
    getListsByFolderId: state => ({id, lists}) => {
      const arr = []
      const fold = state.folders.find(f => f.id === id)
      for (const l of lists)
        if (l.folder && l.folder === id) arr.push(l)
      let order = fold.order
      if (!order) order = []
      return utils.checkMissingIdsAndSortArr(fold.order, arr)
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
      })
    },
    updateOrder({getters}, {id, ids}) {
      folderRef(id).update({
        order: ids,
      })
    },
    saveFolder(c, fold) {
      folderRef(fold.id).update({
        ...fold, 
      })
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
    }
  },
}
