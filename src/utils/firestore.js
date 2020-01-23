
import { fire, auth } from '../store/index'
import fb from 'firebase/app'

export const uid = () => auth.currentUser.uid
export const fd = () => fb.firestore.FieldValue
export const userRef = id => fire.collection('users').doc(id ? id : uid())
export const cacheRef = id => fire.collection('users').doc(id ? id : uid()).collection('cache').doc('cache')
export const setCache = obj => cacheRef().set(obj, {merge: true})
export const taskColl = () => userRef().collection('tasks')
export const listColl = () => userRef().collection('lists')
export const serverTimestamp = () => fb.firestore.FieldValue.serverTimestamp()
export const statsColl = () => userRef().collection('stats')
export const folderColl = () => userRef().collection('folders')
export const taskRef = id => id ? taskColl().doc(id) : taskColl().doc()
export const pomoDoc = () => statsColl().doc('pomo')
export const listRef = id => id ? listColl().doc(id) : listColl().doc()
export const folderRef = id => id ? folderColl().doc(id) : folderColl().doc()
export const tagColl = () => userRef().collection('tags')
export const tagRef = id => id ? tagColl().doc(id) : tagColl().doc()
export const filterColl = () => userRef().collection('filters')
export const filterRef = id => id ? filterColl().doc(id) : filterColl().doc()
export const setTask = (batch, task, ref) => {
  return new Promise((solve, reject) => {
    const save = () => {
      const obj = {
        ...task, handleFiles: null,
        from: 'watchr_web_app', id: ref.id,
        userId: uid(),
      }
      batch.set(cacheRef(), {
        tasks: {
          [ref.id]: obj,
        }
      }, {merge: true})
      batch.set(ref, obj, {merge: true})
      solve()
    }
    if (task.handleFiles)
      task.handleFiles(ref.id).then(save).catch(reject)
    else save()
  })
}

export const setTag = (batch, tag, ref) => {
  const obj = {
    ...tag, id: ref.id,
    from: 'watchr_web_app',
    userId: uid(),
  }
  batch.set(cacheRef(), {
    tags: {
      [ref.id]: obj,
    }
  }, {merge: true})
  batch.set(ref, obj, {merge: true})
}

export const setFolder = (batch, folder, ref) => {
  const obj = {
    ...folder, id: ref.id,
    from: 'watchr_web_app',
    userId: uid(),
  }
  batch.set(cacheRef(), {
    folders: {
      [ref.id]: obj,
    }
  }, {merge: true})
  batch.set(ref, obj, {merge: true})
}
export const setList = (batch, list, ref) => {
  const obj = {
    ...list, id: ref.id,
    from: 'watchr_web_app',
    userId: uid(),
  }
  batch.set(cacheRef(), {
    lists: {
      [ref.id]: obj,
    }
  }, {merge: true})
  batch.set(ref, obj, {merge: true})
}

export const deleteTag = (batch, id) => {
  batch.set(cacheRef(), {
    tags: {
      [id]: fd().delete(),
    },
  }, {merge: true})
  batch.delete(tagRef(id))
}
export const deleteTask = (batch, id) => {
  batch.set(cacheRef(), {
    tasks: {
      [id]: fd().delete(),
    },
  }, {merge: true})
  batch.delete(taskRef(id))
}
export const deleteFolder = (batch, id) => {
  batch.set(cacheRef(), {
    folders: {
      [id]: fd().delete(),
    },
  }, {merge: true})
  batch.delete(folderRef(id))
}
