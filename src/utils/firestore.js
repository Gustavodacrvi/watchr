
import { fire, auth } from '../store/index'
import fb from 'firebase/app'


const CLOUD_FUNCTION_KEY_WORD = 'watchr_web_app'


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
        from: CLOUD_FUNCTION_KEY_WORD, id: ref.id,
        userId: uid(),
      }
      if (!writes)
        batch.set(cacheRef(), {
          tasks: {
            [ref.id]: obj,
          }
        }, {merge: true})
      else
        writes.push({
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
export const cacheBatchedTasks = (batch, writes) => {
  batch.set(cacheRef(), {
    tasks: {
      ...writes.reduce((obj, t) => ({...obj, ...t}), {}),
    },
  }, {merge: true})
}
export const batchSetTasks = (batch, task, ids) => {
  return new Promise(async solve => {
    const promises = []
  
    ids.forEach(id => {
      promises.push(
        setTask(batch, task, taskRef(id), false)
      )
    })
    
    await Promise.all(promises)
    const userId = uid()
    console.log({
      ...ids.reduce((obj, id) => ({
        ...obj, ...{
          [id]: {
            ...task,
            ...task, handleFiles: null,
            from: CLOUD_FUNCTION_KEY_WORD, id,
            userId,
          },
        },
      }), {}),
    })
/*     batch.set(cacheRef(), {
      tasks: {
        ...ids.reduce((obj, id) => ({
          ...obj, ...{
            [id]: {
              ...task,
              ...task, handleFiles: null,
              from: CLOUD_FUNCTION_KEY_WORD, id,
              userId,
            },
          },
        }), {}),
      },
    }, {merge: true}) */
    // solve()
  })
}

export const setTag = (batch, tag, ref) => {
  const obj = {
    ...tag, id: ref.id,
    from: CLOUD_FUNCTION_KEY_WORD,
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
    from: CLOUD_FUNCTION_KEY_WORD,
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
    from: CLOUD_FUNCTION_KEY_WORD,
    userId: uid(),
  }
  batch.set(cacheRef(), {
    lists: {
      [ref.id]: obj,
    }
  }, {merge: true})
  batch.set(ref, obj, {merge: true})
}
export const setPomo = (batch, doc) => {
  const obj = {
    ...doc, id: 'pomo',
    from: CLOUD_FUNCTION_KEY_WORD,
    userId: uid(),
  }
  batch.set(cacheRef(), {
    stats: {
      pomo: obj,
    },
  }, {merge: true})
  batch.set(pomoDoc(), obj, {merge: true})
}
export const setInfo = (batch, info) => {
  const obj = {
    ...info, id: 'info',
    from: CLOUD_FUNCTION_KEY_WORD,
    userId: uid(),
  }
  batch.set(cacheRef(), {
    info: {
      info: obj,
    },
  }, {merge: true})
  batch.set(
      userRef().collection('info').doc('info')
    , obj, {merge: true})
}

export const deleteTag = (batch, id) => {
  batch.set(cacheRef(), {
    tags: {
      [id]: fd().delete(),
    },
  }, {merge: true})
  batch.delete(tagRef(id))
}
export const deleteList = (batch, id) => {
  batch.set(cacheRef(), {
    lists: {
      [id]: fd().delete(),
    },
  }, {merge: true})
  batch.delete(listRef(id))
}
export const deleteTask = (batch, id, cache = true) => {
  if (cache)
    batch.set(cacheRef(), {
      tasks: {
        [id]: fd().delete(),
      },
    }, {merge: true})
  batch.delete(taskRef(id))
}
export const batchDeleteTasks = (batch, ids) => {
  for (const id of ids)
    deleteTask(batch, id, false)
  batch.set(cacheRef(), {
    tasks: {
      ...ids.reduce((obj, id) => ({...obj, [id]: fd().delete()}), {})
    },
  }, {merge: true})
}
export const deleteFolder = (batch, id) => {
  batch.set(cacheRef(), {
    folders: {
      [id]: fd().delete(),
    },
  }, {merge: true})
  batch.delete(folderRef(id))
}
