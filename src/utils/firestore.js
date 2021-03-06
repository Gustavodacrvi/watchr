
import { fire, auth } from '../store/index'
import fb from 'firebase/app'

import Vue from 'vue'

import utils from './index'
import utilsTask from './task'

import mom from 'moment'

export const uid = () => auth.currentUser.uid
export const fd = () => fb.firestore.FieldValue
export const userRef = id => fire.collection('users').doc(id ? id : uid())
export const groupColl = id => fire.collection('groups')
export const infoRef = () => userRef().collection('info').doc('info')
export const cacheRef = id => fire.collection('users').doc(id ? id : uid()).collection('cache').doc('cache')
export const setCache = obj => cacheRef().set(obj, {merge: true})
export const taskColl = () => userRef().collection('tasks')
export const listColl = () => userRef().collection('lists')
export const statsColl = () => userRef().collection('stats')
export const folderColl = () => userRef().collection('folders')
export const taskRef = id => id ? taskColl().doc(id) : taskColl().doc()
export const groupRef = id => id ? groupColl().doc(id) : groupColl().doc()
export const groupInfoRef = groupId => groupRef(groupId).collection('info').doc('info')
export const groupCacheRef = groupId => groupRef(groupId).collection('groupCache').doc('groupCache')
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
export const groupList = (groupId, listId) => {
  const col = groupRef(groupId).collection('lists')

  if (listId)
    return col.doc(listId)
  return col.doc()
}
export const inviteRef = (groupId, id) => {
  const g = groupRef(groupId).collection('invites')
  if (id) return g.doc(id)
  return g.doc()
}
export const setInfo = (batch, info, rootState, writes) => {
  const obj = {
    ...info, id: 'info',
    userId: uid(),
  }

  utils.findChangesBetweenObjs(rootState.userInfo, obj)
  
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

export const saveCalendarOrder = (b, rootState, finalIds, calendarDate, writes) => {
  const savedOrders = rootState.userInfo.calendarOrders || {}
  const target = savedOrders[calendarDate] || {}

  const calendarOrders = utilsTask.getUpdatedCalendarOrders(
    utilsTask.concatArraysRemovingOldEls(target.tasks || [], finalIds),
    calendarDate,
    rootState,
  )

  setInfo(b, {calendarOrders}, rootState, writes)

}
export const setFolder = (batch, folder, id, rootState, writes) => {
  return new Promise((solve, reject) => {
    const save = () => {
        
    const ref = folderRef(id)
    const obj = {
      ...folder, id: ref.id,
      userId: uid(),
    }

    if (obj.handleFiles !== undefined)
      delete obj.handleFiles

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

    solve()
  }
    if (folder.handleFiles)
      folder.handleFiles(folder.id).then(save).catch(reject)
    else save()
  })
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
export const setList = (batch, list, id, rootState, writes, onListSave) => {
  return new Promise((solve, reject) => {
    id = id ? id : utils.getUid()
    const save = () => {
  
      const groupLists = rootState.list.groupLists
      const individualLists = rootState.list.lists
      
      const savedGroupList = groupLists[id]
      const savedIndividualList = individualLists[id]
      
      const hydratedList = {
        ...({...savedGroupList} || {...savedIndividualList} || {}),
        ...list,
      }
    
      const getGroupId = restrict => hydratedList.group || (savedGroupList && !restrict && savedGroupList.group)
    
      const finalObj = ({
        ...hydratedList, handleFiles: null,
        filePromiseHandler: null,
        id,
        userId: uid(),
      })
      const getGroupListRef = () => groupList(getGroupId(), id)
      const getGroupCacheRef = () => groupCacheRef(getGroupId())
      const setGroupList = groupId => {
        batch.set(
          !groupId ? getGroupListRef() : groupList(groupId, id),
          finalObj, {merge: true}
        )
      }
      const setPersonalList = () => {
        batch.set(listRef(id), finalObj, {merge: true})
      }
      const setCache = refCache => {
        batch.set(refCache, {
          lists: {
            [id]: finalObj,
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
          collection: 'lists',
          [id]: obj,
          groupId: !groupId ? getGroupId() : groupId,
        })
      }
      const addPersonalWrite = obj => {
        writes.push({
          collection: 'lists',
          [id]: obj,
        })
      }
      const deletePersonalList = () => {
        batch.delete(listRef(id))
      }
      const deleteGroupList = groupId => {
        batch.delete(!groupId ? getGroupListRef() : groupList(groupId, id))
      }
      const deleteFromPersonalCache = () => {
        batch.set(cacheRef(), {
          lists: {
            [id]: fd().delete()
          },
        }, {merge: true})
      }
      const deleteFromGroupCache = groupId => {
        batch.set(!groupId ? getGroupCacheRef() : groupCacheRef(groupId), {
          lists: {
            [id]: fd().delete()
          },
        }, {merge: true})
      }
      const getListTaskIds = obj => Object.keys(obj).filter(el => obj[el] && obj[el].list === id)
      const setListTasks = toPersonal => {
        getListTaskIds(!toPersonal ? rootState.task.groupTasks : rootState.task.tasks).forEach(
          taskId => setTask(batch, {
            group: toPersonal ? null : getGroupId(true),
            list: id,
          }, rootState, taskId, writes)
        )
      }
    
      const isNewList = !savedGroupList && !savedIndividualList
      const updatingGroupList = !isNewList && savedGroupList && savedGroupList.group === getGroupId()
      const updatingPersonalList = !isNewList && savedIndividualList && !savedIndividualList.group
      const isChangingGroups = savedGroupList && savedGroupList.group !== getGroupId(true)
      
      if (getGroupId(true)) {
    
        if (isNewList || updatingGroupList) { // Create and add list to group/update.
          
          setGroupList()
          
          if (!writes)
            setGroupCache()
          else if (writes.push)
            addSharedWrite(finalObj)
          
        } else if (savedIndividualList) { // Move personal list to shared.
    
          const savedPersonalLists = rootState.list.lists
          rootState.list.lists = {
            ...savedPersonalLists,
            [id]: undefined,
          }
    
          setListTasks()
          deletePersonalList()
          setGroupList()
    
          if (!writes) {
            setGroupCache()
            deleteFromPersonalCache()
          } else if (writes.push) {
            addSharedWrite(finalObj)
            addPersonalWrite(fd().delete())
          }
    
        } else if (isChangingGroups) {
        
          setListTasks()
          deleteGroupList(savedGroupList.group)
          setGroupList(finalObj.group)
          
          if (!writes) {
            setGroupCache(finalObj.group)
            deleteFromGroupCache(savedGroupList.group)
          } else if (writes.push) {
            addSharedWrite(fd().delete(), savedGroupList.group)
            addSharedWrite(finalObj, finalObj.group)
          }
    
        }

        const savedGroupLists = rootState.list.groupLists
        if (onListSave) onListSave(savedGroupList)
        else if (savedGroupList)
          utils.findChangesBetweenObjs(savedGroupList, finalObj)
        else if (!onListSave)
          rootState.list.groupLists = {
            ...savedGroupLists,
            [id]: finalObj,
          }

      } else {
    
        if (isNewList || updatingPersonalList) { // Create and add list to personal/update.
    
          setPersonalList()
          
          if (!writes)
            setPersonalCache()
          else if (writes.push)
            addPersonalWrite(finalObj)
    
        } else if (savedGroupList) { // Move shared list to personal.
    
          const savedGroupLists = rootState.list.groupLists
          rootState.list.groupLists = {
            ...savedGroupLists,
            [id]: undefined,
          }
    
          setListTasks(true)
          deleteGroupList()
          setPersonalList()
    
          if (!writes) {
            setPersonalCache()
            deleteFromGroupCache()
          } else if (writes.push) {
            addPersonalWrite(finalObj)
            addSharedWrite(fd().delete())
          }
    
        }

        const savedPersonalLists = rootState.list.lists
        if (onListSave) onListSave(savedIndividualList)
        else if (savedIndividualList)
          utils.findChangesBetweenObjs(savedIndividualList, finalObj)
        else if (!onListSave)
          rootState.list.lists = {
            ...savedPersonalLists,
            [id]: finalObj,
          }
      }

      solve()
    }
    if (list.handleFiles)
      list.handleFiles(id).then(save).catch(reject)
    else save()
  })
}

export const saveListOrder = (batch, rootState, finalIds, listId, writes) => {
  const list = rootState.list.lists[listId] || rootState.list.groupLists[listId] || {}

  setList(batch, {
    id: listId,
    tasks: utilsTask.concatArraysRemovingOldEls(list.tasks || [], finalIds),
  }, listId, rootState, writes)
}
export const saveFolderOrder = (batch, rootState, finalIds, folderId, writes) => {
  const folder = rootState.folder.folders[folderId] || {}

  setFolder(batch, {
    id: folderId,
    tasks: utilsTask.concatArraysRemovingOldEls(folder.tasks || [], finalIds),
  }, folderId, rootState, writes)
}
export const saveGroupOrder = (batch, rootState, finalIds, groupId, writes) => {
  const group = rootState.group.groups.find(el => el.id === groupId) || {}

  setGroup(batch, {
    id: groupId,
    order: utilsTask.concatArraysRemovingOldEls(group.order || [], finalIds),
  }, groupId, rootState, writes)
}

export const setTask = (batch, task, rootState, id, writes, onTaskSave) => {
  return new Promise((solve, reject) => {
    id = id ? id : utils.getUid()
    const save = () => {
      
      const groupTasks = rootState.task.groupTasks
      const individualTasks = rootState.task.tasks

      const savedGroupTask = groupTasks[id]
      const savedIndividualTask = individualTasks[id]

      const oldTask = savedGroupTask || savedIndividualTask 

      const hydratedTask = {
        ...(oldTask || {}),
        ...task,
      }

      const getGroupId = restrict => hydratedTask.group || (savedGroupTask && !restrict && savedGroupTask.group)

      const finalObj = ({
        ...hydratedTask,
        lastEditDate: mom().format('Y-M-D HH:mm ss'),
        id,
        userId: uid(),
      })

      if (finalObj.handleFiles)
        delete finalObj.handleFiles

      const getGroupTaskRef = () => groupTask(getGroupId(), id)
      const getGroupCacheRef = () => groupCacheRef(getGroupId())
      const setGroupTask = groupId => {
        batch.set(
          !groupId ? getGroupTaskRef() : groupTask(groupId, id),
          finalObj, {merge: true}
        )
      }
      const setPersonalTask = () => {
        batch.set(taskRef(id), finalObj, {merge: true})
      }
      const setCache = refCache => {
        batch.set(refCache, {
          tasks: {
            [id]: finalObj,
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

      const specificDate = task => {
        if (!task || !task.calendar || task.calendar.type !== 'specific')
          return null
        return task.calendar.specific
      }

      const newDate = specificDate(hydratedTask) // Y-M-D
      if (newDate && specificDate(oldTask) !== newDate) {
        saveCalendarOrder(batch, rootState, [id], newDate, writes)
      }


      const getProperty = (oldTask, name) => {
        if (!oldTask || !oldTask[name])
          return null
        return oldTask[name]
      }
      
      const newList = getProperty(hydratedTask, 'list')
      if (newList && getProperty(oldTask, 'list') !== newList) {
        saveListOrder(batch, rootState, [id], newList, writes)
      }
      const newFolder = getProperty(hydratedTask, 'folder')
      if (newFolder && getProperty(oldTask, 'folder') !== newFolder) {
        saveFolderOrder(batch, rootState, [id], newFolder, writes)
      }
      const newGroup = getProperty(hydratedTask, 'group')
      if (newGroup && getProperty(oldTask, 'group') !== newGroup) {
        saveGroupOrder(batch, rootState, [id], newGroup, writes)
      }

  
      const isNewTask = !savedGroupTask && !savedIndividualTask
      const updatingGroupTask = !isNewTask && savedGroupTask && savedGroupTask.group === getGroupId()
      const updatingPersonalTask = !isNewTask && savedIndividualTask && savedIndividualTask.group === null
      const isChangingGroups = savedGroupTask && savedGroupTask.group !== getGroupId(true)

      console.warn('setTask ', finalObj)

      if (getGroupId(true)) {

        if (isNewTask || updatingGroupTask) { // Create and add task to group/update.
          console.log('// Create and add task to group/update.')
          
          setGroupTask()
          
          if (!writes)
            setGroupCache()
          else if (writes.push)
            addSharedWrite(finalObj)
          
        } else if (savedIndividualTask) { // Move personal task to shared.
          console.log('// Move personal task to shared.')

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
            addSharedWrite(finalObj)
            addPersonalWrite(fd().delete())
          }

        } else if (isChangingGroups) {
          console.log('// between groups.')

          deleteGroupTask(savedGroupTask.group)
          setGroupTask(task.group)
          
          if (!writes) {
            setGroupCache(task.group)
            deleteFromGroupCache(savedGroupTask.group)
          } else if (writes.push) {
            addSharedWrite(fd().delete(), savedGroupTask.group)
            addSharedWrite(finalObj, task.group)
          }
          
        }
        
        const saveGroupTasks = rootState.task.groupTasks
        if (onTaskSave) onTaskSave(savedGroupTask)
        else if (savedGroupTask)
          utils.findChangesBetweenObjs(savedGroupTask, finalObj)
        else if (!onTaskSave)
          rootState.task.groupTasks = {
            ...saveGroupTasks,
            [id]: finalObj,
          }
        
      } else {

        if (isNewTask || updatingPersonalTask) { // Create and add task to personal/update.
          console.log('// Create and add task to personal/update.')

          setPersonalTask()

          if (!writes)
            setPersonalCache()
          else if (writes.push)
            addPersonalWrite(finalObj)

        } else if (savedGroupTask) { // Move shared task to personal.
          console.log('// Move shared task to personal.')

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
            addPersonalWrite(finalObj)
            addSharedWrite(fd().delete())
          }
          
        }

        const savedPersonalTasks = rootState.task.tasks
        if (onTaskSave) onTaskSave(savedIndividualTask)
        else if (savedIndividualTask)
          utils.findChangesBetweenObjs(savedIndividualTask, finalObj)
        else if (!onTaskSave)
          rootState.task.tasks = {
            ...savedPersonalTasks,
            [id]: finalObj,
          }
      }

      solve()
    }
    if (task.handleFiles)
      task.handleFiles(id).then(save).catch(reject)
    else save()
  })
}
export const addComment = (b, groupId, room, comment, name, rootState) => {
  const ref = groupCacheRef(groupId)

  const obj = {
    name,
    id: comment,
    userId: uid(),
    files: [],
    reactions: [],
    created: mom().format('Y-M-D HH:mm ss'), 
    createdFire: new Date(),
    readBy: null,
  }
  
  b.set(ref, {
    comments: {
      [room]: {
        [comment]: obj,
      },
    },
  }, {merge: true})

  const target = rootState.group.groups.find(el => el.id === groupId)
  Vue.set(target, 'comments', {
    ...(target.comments || {}),
    [room]: {
      ...(target.comments[room] || {}),
      [comment]: obj,
    },
  })
}
export const readComments = (b, groupId, room, ids, rootState) => {
  const ref = groupCacheRef(groupId)

  const userId = uid()
  b.set(ref, {
    comments: {
      [room]: {
        ...ids.reduce((o, id) => ({...o, [id]: {readBy: {[userId]: true}}}), {}),
      },
    },
  }, {merge: true})

  const target = rootState.group.groups.find(el => el.id === groupId)

  Vue.set(target, 'comments', {
    ...target.comments,
    [room]: {
      ...target.comments[room],
      ...ids.reduce((o, id) => ({...o, [id]: {readBy: {[userId]: true}}}), {}),
    },
  })
}
export const deleteComment = (b, groupId, room, comment, rootState) => {
  const ref = groupCacheRef(groupId)
  
  b.set(ref, {
    comments: {
      [room]: {
        [comment]: fd().delete()
      },
    },
  }, {merge: true})

  const target = rootState.group.groups.find(el => el.id === groupId)
  target.comments[room][comment] = undefined
}
export const cacheBatchedItems = (batch, writes) => {
  const personalWrites = writes.filter(el => !el.groupId && el.collection)
  
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
      const obj = getObj(sharedWrites.filter(w => w.groupId === id && w.collection))
      const toMerge = sharedWrites.filter(w => w.groupId === id && !w.collection).reduce((o, w) => ({...w.obj, ...o}), {})

      const keys = Object.keys(obj)
      keys.forEach(k => {
        delete obj[k].collection
        delete obj[k].groupId
      })

      batch.set(groupCacheRef(id), {...obj, ...toMerge}, {merge: true})
    })
  }
}
export const batchSetTasks = (batch, task, ids, rootState, rootWrites, onTaskSave) => {
  return new Promise(async solve => {
    const promises = []
  
    const writes = rootWrites || []
    ids.forEach(id => {
      promises.push(
        setTask(batch, task, rootState, id, writes, onTaskSave)
      )
    })
    
    await Promise.all(promises)
    if (!rootWrites)
      cacheBatchedItems(batch, writes)
    solve()
  })
}
export const batchSetLists = (batch, list, ids, rootState, rootWrites, onListSave) => {
  return new Promise(async solve => {
  
    const writes = rootWrites || []
    ids.forEach(id => {
      setList(batch, list, id, rootState, writes, onListSave)
    })
    
    if (!rootWrites)
      cacheBatchedItems(batch, writes)
    solve()
  })
}
export const batchSetTags = (batch, tag, ids, rootState, rootWrites) => {
  return new Promise(async solve => {
  
    const writes = rootWrites || []
    ids.forEach(id => {
      setTag(batch, tag, id, rootState, writes)
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
    utils.findChangesBetweenObjs(tagStore, obj, undefined, ['subList'])
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

export const setGroup = (batch, group, id, rootState, writes) => {
  return new Promise((solve, reject) => {
    const save = () => {
      const obj = group

      const allGroups = rootState.group.groups
      const targetGroup = allGroups.find(el => el.id === id)
      if (targetGroup)
        utils.findChangesBetweenObjs(targetGroup, obj)
      else
        rootState.group.groups = [
          ...allGroups,
          obj,
        ]
        
      if (!writes)
        batch.set(groupCacheRef(id), group, {merge: true})
      else if (writes.push)
        writes.push({
          groupId: id,
          obj,
        })

      solve()
    }
    if (group.handleFiles)
      group.handleFiles(id).then(save).catch(reject)
    else save()
  })
}
export const deleteGroup = (b, groupId, rootState) => {
  const cacheRef = groupCacheRef(groupId)

  const allGroups = rootState.group.groups
  const groupTasks = rootState.task.groupTasks
  const i = allGroups.findIndex(el => el.id === groupId)
  rootState.group.groups.splice(i, 1)

  const keys = Object.keys(groupTasks)
  for (const k of keys)
    if (groupTasks[k] && groupTasks[k].group === groupId)
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
export const addGroup = (batch, group, rootState) => {
  return new Promise((solve, reject) => {
    const save = () => {
      const ref = groupRef()
      const infoRef = groupInfoRef(ref.id)
      const cacheRef = groupCacheRef(ref.id)
    
      const userId = uid()
      const u = rootState.user
      
      const groupObj = {
        id: ref.id,
        userId,
      }

      if (group.handleFiles !== undefined)
        delete group.handleFiles
      if (group.created !== undefined)
        delete group.created
      if (group.createdFire !== undefined)
        delete group.createdFire

      const infoObj = {
        ...groupObj,
        name: group.name,
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
      batch.set(cacheRef, {
        ...infoObj,
        ...group,
        lists: {dummy: null},
        smartViewsOrders: {dummy: null},
        tasks: {dummy: null},
        comments: {dummy: null},
      }, {merge: true})

      solve()
    }
    if (group.handleFiles)
      group.handleFiles(group.id).then(save).catch(reject)
    else save()
  })
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
  const groupLists = rootState.list.groupLists
  const sharedList = groupLists[id]

  const obj = {
    lists: {
      [id]: fd().delete(),
    },
  }
  
  if (!sharedList) {
    batch.delete(listRef(id))

    rootState.list.lists = {
      ...rootState.list.lists,
      [id]: undefined,
    }

    if (!writes)
      batch.set(cacheRef(), obj, {merge: true})
    else if (writes.push)
      writes.push({
        collection: 'lists',
        [id]: fd().delete()
      })

  } else {
    batch.delete(groupList(sharedList.group, id))

    rootState.list.groupLists = {
      ...rootState.list.groupLists,
      [id]: undefined,
    }

    if (!writes)
      batch.set(groupCacheRef(sharedList.group), obj, {merge: true})
    else if (writes.push)
      writes.push({
        collection: 'lists',
        [id]: fd().delete(),
        groupId: sharedList.group,
      })
    
  }
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
