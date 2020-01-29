
import { fire, auth } from '../store/index'
import fb from 'firebase/app'

export const uid = () => auth.currentUser.uid
export const fd = () => fb.firestore.FieldValue
export const userRef = id => fire.collection('users').doc(id ? id : uid())
export const infoRef = () => userRef().collection('info').doc('info')
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
export const setTask = (batch, task, ref, writes) => {
  return new Promise((solve, reject) => {
    const save = () => {
      const obj = {
        ...task, handleFiles: null,
        cloud_function_edit: false, id: ref.id,
        userId: uid(),
      }
      if (!writes)
        batch.set(cacheRef(), {
          tasks: {
            [ref.id]: obj,
          }
        }, {merge: true})
      else if (writes.push)
        writes.push({
          collection: 'tasks',
          [ref.id]: obj,
        })
      batch.set(ref, obj, {merge: true})
      solve()
    }
    if (task.handleFiles)
      task.handleFiles(ref.id).then(save).catch(reject)
    else save()
  })
}
export const cacheBatchedItems = (batch, writes) => {
  const obj = {
    ...writes.reduce((obj, write) => ({
      ...obj,
      [write.collection]: {
        ...obj[write.collection],
        ...write,
      }
    }), {})
  }
  const keys = Object.keys(obj)
  keys.forEach(k => delete obj[k].collection)

  batch.set(cacheRef(), obj, {merge: true})
}
export const batchSetTasks = (batch, task, ids, rootWrites) => {
  return new Promise(async solve => {
    const promises = []
  
    const writes = rootWrites || []
    ids.forEach(id => {
      promises.push(
        setTask(batch, task, taskRef(id), writes)
      )
    })
    
    await Promise.all(promises)
    if (!rootWrites)
      cacheBatchedItems(batch, writes)
    solve()
  })
}
export const batchSetLists = (batch, list, ids, rootWrites) => {
  return new Promise(async solve => {
  
    const writes = rootWrites || []
    ids.forEach(id => {
      setList(batch, list, listRef(id), writes)
    })
    
    if (!rootWrites)
      cacheBatchedItems(batch, writes)
    solve()
  })
}

export const setTag = (batch, tag, ref, writes) => {
  const obj = {
    ...tag, id: ref.id,
    cloud_function_edit: false,
    userId: uid(),
  }
  if (!writes)
    batch.set(cacheRef(), {
      tags: {
        [ref.id]: obj,
      }
    }, {merge: true})
  else if (writes.push)
    writes.push({
      collection: 'tags',
      [ref.id]: obj,
    })
  batch.set(ref, obj, {merge: true})
}

export const setFolder = (batch, folder, ref, writes) => {
  const obj = {
    ...folder, id: ref.id,
    cloud_function_edit: false,
    userId: uid(),
  }
  if (!writes)
    batch.set(cacheRef(), {
      folders: {
        [ref.id]: obj,
      }
    }, {merge: true})
  else if (writes.push)
    writes.push({
      collection: 'folders',
      [ref.id]: obj,
    })
  batch.set(ref, obj, {merge: true})
}
export const setList = (batch, list, ref, writes) => {
  const obj = {
    ...list, id: ref.id,
    cloud_function_edit: false,
    userId: uid(),
  }
  if (!writes)
    batch.set(cacheRef(), {
      lists: {
        [ref.id]: obj,
      }
    }, {merge: true})
  else if (writes.push)
    writes.push({
      collection: 'lists',
      [ref.id]: obj,
    })
  batch.set(ref, obj, {merge: true})
}
export const setPomo = (batch, doc) => {
  const obj = {
    ...doc, id: 'pomo',
    cloud_function_edit: false,
    userId: uid(),
  }
  batch.set(cacheRef(), {
    stats: {
      pomo: obj,
    },
  }, {merge: true})
  batch.set(pomoDoc(), obj, {merge: true})
}
export const setInfo = (batch, info, writes) => {
  const obj = {
    ...info, id: 'info',
    cloud_function_edit: false,
    userId: uid(),
  }
  if (!writes)
    batch.set(cacheRef(), {
      info: {
        info: obj,
      },
    }, {merge: true})
  else if (writes.push)
    writes.push({
      collection: 'info',
      info: obj,
    })
  batch.set(
      userRef().collection('info').doc('info')
    , obj, {merge: true})
}

export const deleteTag = (batch, id, writes) => {
  if (!writes)
    batch.set(cacheRef(), {
      tags: {
        [id]: fd().delete(),
      },
    }, {merge: true})
  else if (writes.push)
    writes.push({
      collection: 'tags',
      [id]: fd().delete(),
    })
  batch.delete(tagRef(id))
}
export const deleteList = (batch, id, writes) => {
  if (!writes)
    batch.set(cacheRef(), {
      lists: {
        [id]: fd().delete(),
      },
    }, {merge: true})
  else if (writes.push)
    writes.push({
      collection: 'lists',
      [id]: fd().delete(),
    })
  batch.delete(listRef(id))
}
export const deleteTask = (batch, id, writes) => {
  if (!writes)
    batch.set(cacheRef(), {
      tasks: {
        [id]: fd().delete(),
      },
    }, {merge: true})
  else if (writes.push)
    writes.push({
      collection: 'tasks',
      [id]: fd().delete(),
    })
  batch.delete(taskRef(id))
}
export const batchDeleteTasks = (batch, ids) => {
  for (const id of ids)
    deleteTask(batch, id, true)
  batch.set(cacheRef(), {
    tasks: {
      ...ids.reduce((obj, id) => ({...obj, [id]: fd().delete()}), {})
    },
  }, {merge: true})
}
export const deleteFolder = (batch, id, writes) => {
  if (!writes)
    batch.set(cacheRef(), {
      folders: {
        [id]: fd().delete(),
      },
    }, {merge: true})
  else if (writes.push)
    writes.push({
      collection: 'folders',
      [id]: fd().delete()
    })
  batch.delete(folderRef(id))
}
