
import { fire, auth } from '../store/index'
import fb from 'firebase/app'

import utils from './index'

export const uid = () => auth.currentUser.uid
export const fd = () => fb.firestore.FieldValue
export const userRef = id => fire.collection('users').doc(id ? id : uid())
export const groupColl = id => fire.collection('groups')
export const infoRef = () => userRef().collection('info').doc('info')
export const cacheRef = id => fire.collection('users').doc(id ? id : uid()).collection('cache').doc('cache')
export const setCache = obj => cacheRef().set(obj, {merge: true})
export const taskColl = () => userRef().collection('tasks')
export const listColl = () => userRef().collection('lists')
export const serverTimestamp = () => fb.firestore.FieldValue.serverTimestamp()
export const statsColl = () => userRef().collection('stats')
export const folderColl = () => userRef().collection('folders')
export const taskRef = id => id ? taskColl().doc(id) : taskColl().doc()
export const groupRef = id => id ? groupColl().doc(id) : groupColl().doc()
export const groupInfoRef = groupId => groupRef(groupId).collection('info').doc('info')
export const groupCacheRef = groupId => groupRef(groupId).collection('groupCache').doc('groupCache')
export const pomoDoc = () => statsColl().doc('pomo')
export const listRef = id => id ? listColl().doc(id) : listColl().doc()
export const folderRef = id => id ? folderColl().doc(id) : folderColl().doc()
export const tagColl = () => userRef().collection('tags')
export const tagRef = id => id ? tagColl().doc(id) : tagColl().doc()
export const filterColl = () => userRef().collection('filters')
export const filterRef = id => id ? filterColl().doc(id) : filterColl().doc()
export const inviteRef = (groupId, id) => groupRef(groupId).collection('invites').doc(id ? id : undefined)
export const setTask = (batch, task, rootState, id, writes) => {
  return new Promise((solve, reject) => {
    const ref = taskRef(id)
    const save = () => {
      const obj = {
        ...task, handleFiles: null,
        id: ref.id,
        userId: uid(),
      }

      const allTasks = rootState.task.tasks
      const taskStore = allTasks[ref.id]
      if (taskStore)
        utils.findChangesBetweenObjs(taskStore, obj)
      else
        rootState.task.tasks = {
          ...allTasks,
          [ref.id]: obj,
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
export const batchSetTasks = (batch, task, ids, rootState, rootWrites) => {
  return new Promise(async solve => {
    const promises = []
  
    const writes = rootWrites || []
    ids.forEach(id => {
      promises.push(
        setTask(batch, task, rootState, id, writes)
      )
    })
    
    await Promise.all(promises)
    if (!rootWrites)
      cacheBatchedItems(batch, writes)
    solve()
  })
}
export const batchSetLists = (batch, list, ids, rootState, rootWrites) => {
  return new Promise(async solve => {
  
    const writes = rootWrites || []
    ids.forEach(id => {
      setList(batch, list, id, rootState, writes)
    })
    
    if (!rootWrites)
      cacheBatchedItems(batch, writes)
    solve()
  })
}

export const setTag = (batch, tag, id, rootState, writes) => {
  const ref = tagRef(id)
  const obj = {
    ...tag, id: ref.id,
    userId: uid(),
  }

  const allTag = rootState.tag.tags
  const tagStore = allTag[ref.id]
  if (tagStore)
    utils.findChangesBetweenObjs(tagStore, obj)
  else
    rootState.tag.tags = {
      ...allTag,
      [ref.id]: obj,
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

export const setFolder = (batch, folder, id, rootState, writes) => {
  const ref = folderRef(id)
  const obj = {
    ...folder, id: ref.id,
    userId: uid(),
  }

  const allFolders = rootState.folder.folders
  const folderStore = allFolders[ref.id]
  if (folderStore)
    utils.findChangesBetweenObjs(folderStore, obj)
  else
    rootState.folder.folders = {
      ...allFolders,
      [ref.id]: obj,
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
export const setGroupInfo = (batch, group, id, rootState) => {
  const infoRef = groupInfoRef(id)
  const cacheRef = groupCacheRef(id)

  const allGroups = rootState.group.groups
  const i = rootState.group.groups.findIndex(el => el.id === id)
  utils.findChangesBetweenObjs(allGroups[i], {
    ...allGroups[i],
    ...group,
  })

  batch.set(infoRef, group, {merge: true})
  batch.set(cacheRef, group, {merge: true})
}
export const deleteGroup = (b, groupId, rootState) => {
  const cacheRef = groupCacheRef(groupId)

  const allGroups = rootState.group.groups
  const groupTasks = rootState.task.groupTasks
  const i = allGroups.findIndex(el => el.id === groupId)
  rootState.group.groups.splice(i, 1)

  const keys = Object.keys(groupTasks)
  for (const k of keys)
    if (groupTasks[k].group === groupId)
      rootState.task.groupTasks[k] = undefined
  rootState.task.groupTasks = {...rootState.task.groupTasks}

  b.delete(cacheRef)
}
export const deleteInvite = (batch, groupId, inviteId) => {
  batch.delete(inviteRef(groupId, inviteId))
}
export const addGroup = (batch, name, rootState) => {
  const ref = groupRef()
  const infoRef = groupInfoRef(ref.id)
  const cacheRef = groupCacheRef(ref.id)

  const userId = uid()
  const u = rootState.user
  
  const groupObj = {
    id: ref.id,
    userId,
  }

  const infoObj = {
    ...groupObj,
    name,
    users: {
      [userId]: true,
    },
    profiles: {
      [userId]: {
        userId,
        displayName: u.displayName,
        photoURL: u.photoURL || null,
        email: u.email,
      },
    }
  }

  const allGroups = rootState.group.groups
  rootState.group.groups = [
    ...allGroups,
    infoObj,
  ]

  batch.set(ref, groupObj, {merge: true})
  batch.set(infoRef, infoObj, {merge: true})
  batch.set(cacheRef, infoObj, {merge: true})
}
export const setList = (batch, list, id, rootState, writes) => {
  const ref = listRef(id)
  const obj = {
    ...list, id: ref.id,
    userId: uid(),
  }

  const allLists = rootState.list.lists
  const listStore = allLists[ref.id]
  if (listStore)
    utils.findChangesBetweenObjs(listStore, obj)
  else
    rootState.list.lists = {
      ...allLists,
      [ref.id]: obj,
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

export const deleteTag = (batch, id, rootState, writes) => {
  rootState.tag.tags = {
    ...rootState.tag.tags,
    [id]: undefined,
  }
  
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
export const deleteList = (batch, id, rootState, writes) => {
  rootState.list.lists = {
    ...rootState.list.lists,
    [id]: undefined,
  }
  
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
export const deleteTask = (batch, id, rootState, writes) => {
  rootState.task.tasks = {
    ...rootState.task.tasks,
    [id]: undefined,
  }
  
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
export const batchDeleteTasks = (batch, ids, rootState) => {
  for (const id of ids)
    deleteTask(batch, id, rootState, true)
  batch.set(cacheRef(), {
    tasks: {
      ...ids.reduce((obj, id) => ({...obj, [id]: fd().delete()}), {})
    },
  }, {merge: true})
}
export const deleteFolder = (batch, id, rootState, writes) => {
  rootState.folder.folders = {
    ...rootState.folder.folders,
    [id]: undefined,
  }
  
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
