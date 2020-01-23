
import { fire, auth } from './index'
import fb from 'firebase/app'

import utils from '../utils'
import utilsTask from '../utils/task'
import MemoizeGetters from './memoFunctionGetters'
import { folderColl, uid, folderRef, serverTimestamp, listRef, userRef, taskRef, addTask } from '../utils/firestore'
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
      const batch = fire.batch()
      
      const ref = folderRef()
      const obj = {
        userId: uid(),
        tasks: [],
        files: [],
        createdFire: serverTimestamp(),
        created: mom().format('Y-M-D HH:mm ss'),
        ...fold,
        defaultShowing: true,
        from: 'watchr_web_app',
      }
      
      batch.set(ref, obj, {merge: true})
      batch.set(cacheRef(), {
        folders: {
          [ref.id]: obj,
        },
      }, {merge: true})

      batch.commit()
    },
    updateFoldersOrder(c, ids) {
      userRef(uid()).update({
        folders: ids,
      })
    },
    updateOrder(c, {id, ids}) {
      const batch = fire.batch()
      
      const ref = folderRef(id)
      const obj = {
        order: ids,
        from: 'watchr_web_app',
      }

      batch.set(ref, obj, {merge: true})
      batch.set(cacheRef(), {
        folders: {
          [ref.id]: obj,
        },
      }, {merge: true})

      batch.commit()
    },
    saveFolder(c, fold) {
      const batch = fire.batch()
      
      const ref = folderRef(fold.id)
      const obj = {
        ...fold,
        from: 'watchr_web_app',
      }
      
      batch.set(ref, obj, {merge: true})
      batch.set(cacheRef(), {
        folders: {
          [ref.id]: obj,
        },
      }, {merge: true})
      
      batch.commit()
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
        const ref = taskRef(id)
        
        const obj = {
          list: null,
          folder: folderId,
          heading: null,
          from: 'watchr_web_app'
        }
        
        batch.update(ref, obj)
        batch.set(cacheRef(), {
          tasks: {
            [id]: obj,
          }
        })
      }
      const ref = folderRef(folderId)
      const obj = {
        smartViewsOrders: views,
        from: 'watchr_web_app',
      }
      
      batch.set(ref, obj, {merge: true})
      batch.set(cacheRef(), {
        folders: {
          [ref.id]: obj,
        },
      }, {merge: true})

      batch.commit()
    },
    moveTasksToFolderCalendarOrder({rootState}, {ids, taskIds, date, folderId}) {
      const batch = fire.batch()

      for (const id of taskIds) {
        const ref = taskRef(id)
        const obj = {
          folder: folderId,
          list: null,
          heading: null,
          from: 'watchr_web_app',
        }
        
        batch.update(ref, obj)
        batch.set(cacheRef(), {
          tasks: {
            [id]: obj,
          }
        })
      }

      const calendarOrders = utilsTask.getUpdatedCalendarOrders(ids, date, rootState)
      
      batch.set(userRef(), {calendarOrders}, {merge: true})

      batch.commit()
    },
    addTaskByIndex(c, {ids, index, task, folderId, newTaskRef}) {
      const batch = fire.batch()

      addTask(batch, {
        userId: uid(),
        ...task,
      }, newTaskRef).then(() => {
        ids.splice(index, 0, newTaskRef.id)
        const ref = folderRef(folderId)
        const obj = {
          tasks: ids,
          from: 'watchr_web_app',
        }
        
        batch.set(ref, obj, {merge: true})
        batch.set(cacheRef(), {
          folders: {
            [ref.id]: obj,
          },
        }, {merge: true})
  
        batch.commit()
      })
    },
    moveListBetweenFolders(c, {folder, id, ids}) {
      const batch = fire.batch()

      const foldRef = folderRef(folder)
      const liRef = listRef(id)
      const foldObj = {
        order: ids,
        from: 'watchr_web_app',
      }
      const liObj = {
        folder,
        from: 'watchr_web_app',
      }

      batch.set(foldRef, foldObj, {merge: true})
      batch.set(liRef, liObj, {merge: true})

      batch.set(cacheRef(), {
        folders: {
          [folder]: foldObj,
        },
        lists: {
          [id]: liObj,
        },
      }, {merge: true})

      batch.commit()
    },
    deleteFolderById({getters}, {id, lists, tasks}) {
      const batch = fire.batch()

      const folderLists = getters.getListsByFolderId({id, lists})
      const folderTasks = tasks.filter(t => t.folder === id)
      for (const l of folderLists)
        batch.update(listRef(l.id), {
          folder: null,
        })
      for (const t of folderTasks) {
        const ref = taskRef(t.id)
        const obj = {
          folder: null,
          from: 'watchr_web_app',
        }

        batch.update(ref, obj)
        batch.set(cacheRef(), {
          tasks: {
            [id]: obj,
          }
        })
      }
      
      batch.delete(folderRef(id))

      batch.commit()
    },
    saveSmartViewHeadingTasksOrder({getters}, {ids, folderId, smartView}) {
      const folder = getters.getFoldersById([folderId])[0]
      let views = folder.smartViewsOrders
      if (!views) views = {}
      views[smartView] = ids

      const ref = folderRef(folderId)
      const obj = {
        from: 'watchr_web_app',
        smartViewsOrders: views,
      }
      
      batch.set(ref, obj, {merge: true})
    },
  },
}
