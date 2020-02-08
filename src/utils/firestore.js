
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
export const groupTask = (groupId, taskId) => {
  const col = groupRef(groupId).collection('tasks')

  if (taskId)
    return col.doc(taskId)
  return col.doc()
}
export const inviteRef = (groupId, id) => {
  const g = groupRef(groupId).collection('invites')
  if (id) return g.doc(id)
  return g.doc()
}
export const setTask = (batch, task, rootState, id, writes) => {
  return new Promise((solve, reject) => {
    const save = () => {

      id = id ? id : utils.getUid()
      
      const groupTasks = rootState.task.groupTasks
      const individualTasks = rootState.task.tasks

      const savedGroupTask = groupTasks[id]
      const savedIndividualTask = individualTasks[id]

      const getGroupId = restrict => task.group || (savedGroupTask && !restrict && savedGroupTask.group)
  
      const getObj = () => ({
        ...(savedGroupTask || savedIndividualTask || {}),
        ...task, handleFiles: null,
        id,
        userId: uid(),
      })
      const getGroupTaskRef = () => groupTask(getGroupId(), id)
      const getGroupCacheRef = () => groupCacheRef(getGroupId())
      const setGroupTask = groupId => {
        batch.set(
          !groupId ? getGroupTaskRef() : groupTask(groupId, id),
          getObj(), {merge: true}
        )
      }
      const setPersonalTask = () => {
        batch.set(taskRef(id), getObj(), {merge: true})
      }
      const setCache = refCache => {
        batch.set(refCache, {
          tasks: {
            [id]: getObj(),
          },
        }, {merge: true})
      }
      const setGroupCache = groupId => {
        setCache(
          !groupId ? getGroupCacheRef() : groupCacheRef(groupId),
        )
      }
      const setPersonalCache = () => {
        setCache(
          cacheRef(),
        )
      }
      const addSharedWrite = (obj, groupId) => {
        writes.push({
          collection: 'tasks',
          [id]: obj,
          groupId: !groupId ? getGroupId() : groupId,
        })
      }
      const addPersonalWrite = obj => {
        writes.push({
          collection: 'tasks',
          [id]: obj,
        })
      }
      const deletePersonalTask = () => {
        batch.delete(taskRef(id))
      }
      const deleteGroupTask = groupId => {
        batch.delete(!groupId ? getGroupTaskRef() : groupTask(groupId, id))
      }
      const deleteFromPersonalCache = () => {
        batch.set(cacheRef(), {
          tasks: {
            [id]: fd().delete()
          },
        }, {merge: true})
      }
      const deleteFromGroupCache = groupId => {
        batch.set(!groupId ? getGroupCacheRef() : groupCacheRef(groupId), {
          tasks: {
            [id]: fd().delete()
          },
        }, {merge: true})
      }
  
      const isNewTask = !savedGroupTask && !savedIndividualTask
      const updatingGroupTask = !isNewTask && savedGroupTask && savedGroupTask.group === getGroupId()
      const updatingPersonalTask = !isNewTask && savedIndividualTask && savedIndividualTask.group === null
      const isChangingGroups = savedGroupTask && savedGroupTask.group !== getGroupId(true)
      
      if (getGroupId(true)) {

        const saveGroupTasks = rootState.task.groupTasks
        rootState.task.groupTasks = {
          ...saveGroupTasks,
          [id]: getObj(),
        }
        
        if (isNewTask || updatingGroupTask) { // Create and add task to group/update.
          
          setGroupTask()
          
          if (!writes)
            setGroupCache()
          else if (writes.push)
            addSharedWrite(getObj())

        } else if (savedIndividualTask) { // Move personal task to shared.

          const savedPersonalTasks = rootState.task.tasks
          rootState.task.tasks = {
            ...savedPersonalTasks,
            [id]: undefined,
          }
          
          deletePersonalTask()
          setGroupTask()

          if (!writes) {
            setGroupCache()
            deleteFromPersonalCache()
          } else if (writes.push) {
            addSharedWrite(getObj())
            addPersonalWrite(fd().delete())
          }

        } else if (isChangingGroups) {

          deleteGroupTask(savedGroupTask.group)
          setGroupTask(task.group)
          
          if (!writes) {
            setGroupCache(task.group)
            deleteFromGroupCache(savedGroupTask.group)
          } else if (writes.push) {
            addSharedWrite(fd().delete(), savedGroupTask.group)
            addSharedWrite(getObj(), task.group)
          }
          
        }
      } else {

        const savedPersonalTasks = rootState.task.tasks
        rootState.task.tasks = {
          ...savedPersonalTasks,
          [id]: getObj(),
        }
        
        if (isNewTask || updatingPersonalTask) { // Create and add task to personal/update.

          setPersonalTask()

          if (!writes)
            setPersonalCache()
          else if (writes.push)
            addPersonalWrite(getObj())

        } else if (savedGroupTask) { // Move shared task to personal.

          const saveGroupTasks = rootState.task.groupTasks
          rootState.task.groupTasks = {
            ...saveGroupTasks,
            [id]: undefined,
          }

          deleteGroupTask()
          setPersonalTask()

          if (!writes) {
            setPersonalCache()
            deleteFromGroupCache()
          } else if (writes.push) {
            addPersonalWrite(getObj())
            addSharedWrite(fd().delete())
          }
          
        }
      }

      solve()
    }
    if (task.handleFiles)
      task.handleFiles(ref.id).then(save).catch(reject)
    else save()
  })
}
export const cacheBatchedItems = (batch, writes) => {
  const personalWrites = writes.filter(el => !el.groupId)
  
  const getObj = arr => ({
    ...arr.reduce((obj, write) => ({
      ...obj,
      [write.collection]: {
        ...obj[write.collection],
        ...write,
      }
    }), {})
  })
  
  const personalObj = getObj(personalWrites)
  
  const personalKeys = Object.keys(personalObj)
  personalKeys.forEach(k => delete personalObj[k].collection)
  
  if (personalWrites.length > 0)
    batch.set(cacheRef(), personalObj, {merge: true})
  
  const sharedWrites = writes.filter(el => el.groupId)
  if (sharedWrites.length > 0) {

    const idSet = new Set()
    for (const w of sharedWrites)
      if (!idSet.has(w.groupId))
        idSet.add(w.groupId)

    idSet.forEach(id => {
      const obj = getObj(sharedWrites.filter(w => w.groupId === id))

      const keys = Object.keys(obj)
      keys.forEach(k => {
        delete obj[k].collection
        delete obj[k].groupId
      })

      batch.set(groupCacheRef(id), obj, {merge: true})
    })
  }
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
export const rejectInvite = (batch, groupId, inviteId) => {
  batch.set(inviteRef(groupId, inviteId), {
    denied: true,
  }, {merge: true})
}
export const deleteInvite = (batch, groupId, inviteId) => {
  batch.delete(inviteRef(groupId, inviteId))
}
export const acceptInvite = (batch, groupId, inviteId) => {
  batch.set(inviteRef(groupId, inviteId), {
    denied: false,
  }, {merge: true})
}
export const removeMember = (batch, groupId, uid, rootState) => {
  const infoRef = groupInfoRef(groupId)
  const cacheRef = groupCacheRef(groupId)

  const obj = {
    users: {
      [uid]: fd().delete(),
    },
    profiles: {
      [uid]: fd().delete(),
    },
  }

  const allGroups = rootState.group.groups
  const i = allGroups.findIndex(el => el.id === groupId)
  const target = allGroups[i]
  utils.findChangesBetweenObjs(target, {
    ...target,
    ...{
      users: {
        ...target.users,
        [uid]: undefined
      },
      profiles: {
        ...target.profiles,
        [uid]: undefined
      },
    },
  })
  
  batch.set(infoRef, obj, {merge: true})
  batch.set(cacheRef, obj, {merge: true})
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
        uid: userId,
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
  const groupTasks = rootState.task.groupTasks
  const sharedTask = groupTasks[id]

  const obj = {
    tasks: {
      [id]: fd().delete(),
    },
  }
  
  if (!sharedTask) {
    batch.delete(taskRef(id))

    rootState.task.tasks = {
      ...rootState.task.tasks,
      [id]: undefined,
    }
    
    if (!writes)
    batch.set(cacheRef(), obj, {merge: true})
    else if (writes.push)
    writes.push({
      collection: 'tasks',
      [id]: fd().delete(),
    })
    
  } else {
    batch.delete(groupTask(sharedTask.group, id))
    
    rootState.task.groupTasks = {
      ...rootState.task.groupTasks,
      [id]: undefined,
    }

    if (!writes)
      batch.set(groupCacheRef(sharedTask.group), obj, {merge: true})
    else if (writes.push)
      writes.push({
        collection: 'tasks',
        [id]: fd().delete(),
        groupId: sharedTask.group,
      })
  }
}
export const batchDeleteTasks = (batch, ids, rootState) => {
  const writes = []
  
  for (const id of ids)
    deleteTask(batch, id, rootState, writes)
  
  cacheBatchedItems(batch, writes)
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
