
import { fire, auth } from './index'
import fb from 'firebase/app'

import utils from '../utils'
import { folderColl, uid, folderRef, listRef } from '../utils/firestore'

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
    getListsByFolderId: c => ({id, lists}) => {
      const arr = []
      for (const l of lists)
        if (l.folder && l.folder === id) arr.push(l)
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
