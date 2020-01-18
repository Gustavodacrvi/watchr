
import { fire, auth } from './index'
import fb from 'firebase/app'

import utils from '../utils'
import utilsTask from "@/utils/task"
import MemoizeGetters from './memoFunctionGetters'
import { listRef, userRef, uid, listColl, taskRef, serverTimestamp, fd, addTask, folderRef } from '../utils/firestore'
import router from '../router'

import mom from 'moment'

const TOD_STR = mom().format('Y-M-D')

export default {
  namespaced: true,
  state: {
    lists: [],
  },
  getters: {
    sortedLists(state, d, {userInfo}, rootGetters) {
      const {lists} = state
      if (userInfo)
        return rootGetters.checkMissingIdsAndSortArr(userInfo.lists, lists)
      return []
    },
    ...MemoizeGetters(null, {
      getTasks({}, tasks, id) {
        return tasks.filter(el => el.list === id)
      },
      isListCompleted: {
        getter(c, list, moment) {
          return utils.isItemCompleted(list, moment)
        },
        cache(args) {
          let task = args[0]
          const i = {
            completed: task.completed,
            calendar: task.calendar,
          }
          return JSON.stringify({i, a: [args[1], args[2]]})
        },
      },
      isListShowingOnDate: {
        getter({}, list, date) {
          if (!utilsTask.hasCalendarBinding(list) || list.calendar.type === 'someday')
            return true
          
          const c = list.calendar
  
          // specific
          const tod = mom(date, 'Y-M-D')
          if (c.type === 'specific') {
            const specific = mom(c.specific, 'Y-M-D')

            return specific.isSameOrBefore(tod, 'day')
          }
  
          const begins = mom(c.begins, 'Y-M-D')
  
          if (c.ends) {
            if (c.ends.type === 'on date' && tod.isAfter(mom(c.ends.onDate, 'Y-M-D'), 'day'))
              return false
            else if (c.ends.times === null)
              return false
          }
          if (c.begins && begins.isAfter(tod, 'day'))
            return false
          
          if (c.type === 'after completion') {
            const lastComplete = c.lastCompleteDate ? mom(c.lastCompleteDate, 'Y-M-D') : begins
            if (begins.isSame(tod, 'day')) return true
            
            const dayDiff = tod.diff(lastComplete, 'days')
            if (dayDiff < 0) return false
            const eventNotToday = dayDiff % c.afterCompletion !== 0
            if (eventNotToday) return false
          }
          
          if (c.type === 'daily') {
            const dayDiff = tod.diff(begins, 'days')
            if (dayDiff < 0) return false
            const eventNotToday = dayDiff % c.daily !== 0
            if (eventNotToday) return false
          }
          if (c.type === 'weekly') {
            const dayOfTheWeek = parseInt(tod.format('d'), 10)
            if (!c.weekly.days.includes(dayOfTheWeek))
            return false
            
            const weekDiff = tod.diff(begins.startOf('week'), 'weeks')
            if (weekDiff < 0) return false
            const eventNotToday = weekDiff % c.weekly.every !== 0
            if (eventNotToday) return false
          }
          if (c.type === 'monthly') {
            const monthDiff = tod.diff(begins.startOf('month'), 'months')
            if (monthDiff < 0) return false
            const eventNotToday = monthDiff % c.monthly.every !== 0
            if (eventNotToday) return false
  
            const next = utilsMoment.getNextMonthlyDate(c, tod.clone().subtract(1, 'd'))
  
            if (!next.isSame(tod, 'day')) return false
          }
          if (c.type === 'yearly') {
            const month = tod.month() + 1
            if (!c.yearly.months.includes(month))
              return false
            
            const yearDiff = tod.diff(begins.startOf('year'), 'years')
            if (yearDiff < 0) return false
            const eventNotToday = yearDiff % c.yearly.every !== 0
            if (eventNotToday) return false
  
            const next = utilsMoment.getNextMonthlyDate({
              monthly: {...c.yearly, every: 1}, begins: c.begins
            }, tod.clone().subtract(1, 'd'))
  
            if (!next.isSame(tod, 'day')) return false
          }
  
  
  
          return true
        },
        cache(args) {
          return JSON.stringify({
            task: args[0].calendar,
            date: args[1],
            onlySpecific: args[2],
          })
        },
      },
      isListSomeday: {
        getter(c, list) {
          return list.calendar && list.calendar.type === 'someday'
        },
        cache(args) {
          return JSON.stringify({c: args[0].calendar})
        },
      },
      getListCalendarStr: {
        getter({}, list, l) {
          const c = list.calendar
          if (!c) return null
    
          if (c.type === 'specific') {
            const str = utils.getHumanReadableDate(c.specific, l)
            if (str === 'Today') return 'Today'
            if (str === 'Tomorrow') return 'Tomorrow'
            return str
          }
        },
        cache(args) {
          return JSON.stringify({
            c: args[0].calendar,
          })
        },
      },
      filterAppnavLists: {
        getter({getters}, lists) {
          return lists.filter(l =>
              !getters.isListCompleted(l) &&
              !getters.isListSomeday(l) &&
              getters.isListShowingOnDate(l, TOD_STR)
            )
        },
        cache(args) {
          return JSON.stringify({
            c: args[0].map(el => ({
              c: el.completed,
              ca: el.calendar,
            }))
          })
        },
      },
      getListDeadlineStr: {
        getter({getters}, list, date, l) {
          if (!list.deadline)
            return null
          return utils.getHumanReadableDate(list.deadline, l) + ' ' + getters.getListDeadlineDaysLeftStr(list.deadline, date)
        },
        cache(args) {
          return JSON.stringify({
            c: args[0].deadline,
          })
        },
      },
      getListDeadlineDaysLeftStr: {
        getter(c, deadline, date) {
          const dead = mom(deadline, 'Y-M-D')
          const compare = mom(date, 'Y-M-D')
          const diff = dead.diff(compare, 'days')
          if (diff === 0)
            return ''
          else if (diff === 1)
            return `1 day left`
          return `${diff} days left`
        },
        cache(args) {
          return JSON.stringify(args)
        }
      },
    }),
    ...MemoizeGetters('lists', {
      getListsByName: {
        react: [
          'name',
        ],
        getter({state}, names) {
          const arr = []
          for (const n of names) {
            const list = state.lists.find(el => el.name === n)
            if (list) arr.push(list)
          }
          return arr
        },
      },
      getListsById({state}, ids) {
        const arr = []
        for (const id of ids) {
          const list = state.lists.find(el => el.id === id)
          if (list) arr.push(list)
        }
        return arr
      },
      getListByName: {
        react: ['name'],
        getter({state}, name) {
          return state.lists.find(l => l.name.trim() === name)
        },
      },
      getAllTasksOrderByList: {
        react: [
          'headingsOrder',
          'headings',
          'tasks',
        ],
        getter({state, rootGetters}, listId) {
          const list = state.lists.find(el => el.id === listId)
          let ord = list.tasks.slice()
          
          let headsOrder = list.headingsOrder.slice() || []
    
          const heads = rootGetters.checkMissingIdsAndSortArr(headsOrder, list.headings)
          
          for (const h of heads) {
            ord = [...ord, ...h.tasks]
          }
          
          return ord
        },
      },
      pieProgress({getters}, tasks, listId, isTaskCompleted) {
          const ts = getters.getTasks(tasks, listId)
          const numberOfTasks = ts.length
          let completedTasks = 0
          
          let compareDate = null
    
          ts.forEach(el => {
            if (isTaskCompleted(el, mom().format('Y-M-D'), compareDate)) completedTasks++
          })
          const result = 100 * completedTasks / numberOfTasks
          if (isNaN(result)) return 0
          return result
        },
    }),
    getFavoriteLists(state) {
      return state.lists.filter(el => el.favorite).map(f => ({...f, icon: 'tasks', color: 'var(--primary)', type: 'list'}))
    },
  },
  actions: {
    getData({state}) {
      const id = uid()
      if (id)
      return Promise.all([
        new Promise(resolve => {
          listColl().where('userId', '==', id).onSnapshot(snap => {
            utils.getDataFromFirestoreSnapshot(state, snap.docChanges(), 'lists')
            resolve()
          })
        }),
      ])
    },

    // ADD

    duplicateList(c, {list, rootTasks, headingTasks}) {
      const batch = fire.batch()

      const name = list.name + ' (2)'
      const newListRef = listRef()

      const createTasks = (arr, tasks) => {
        for (const t of tasks) {
          const ref = taskRef()
          batch.set(ref, {
            ...t, id: null, list: newListRef.id,
          })
          arr.push({
            oldId: t.id,
            newId: ref.id,
          })
        }
      }

      const newRootTasks = []
      const newHeadingTasks = []
      createTasks(newRootTasks, rootTasks)
      createTasks(newHeadingTasks, headingTasks)

      const headings = list.headings.slice()
      const headingsOrder = list.headingsOrder.slice()

      for (const h of headings) {
        const newIds = []
        for (const id of h.tasks) {
          const task = newHeadingTasks.find(t => t.oldId === id)
          newIds.push(task.newId)
        }
        h.tasks = newIds
      }

      batch.set(newListRef, {
        headingsOrder,
        headings,
        name,
        tasks: newRootTasks.map(t => t.newId),
        userId: uid(),
        users: [uid()],
      })

      batch.commit()
    },
    addListInFolderByIndexFromView(c, {list, newItemRef, ids, folderId}) {
      const batch = fire.batch()

      batch.update(folderRef(folderId), {
        order: ids,
      })

      list.folder = folderId

      batch.set(newItemRef, list)

      batch.commit()
    },
    addList({}, {name, ids, index, folderId}) {
      let folder = folderId
      if (!folder) folder = null
      const obj = {
        name, folder,
        smartViewsOrders: {},
        userId: uid(),
        createdFire: serverTimestamp(),
        created: mom().format('Y-M-D HH:mm ss'),
        headings: [],
        headingsOrder: [],
        tasks: [],
      }
      if (index === undefined && folder === null)
        userRef().collection('lists').add(obj)
      else if (index !== undefined && folder === null) {
        const batch = fire.batch()
  
        const ord = ids.slice()
        const ref = listRef()
        batch.set(ref, obj)
        ord.splice(index, 0, ref.id)
        batch.update(userRef(), {
          lists: ord,
        })
  
        batch.commit()
      } else {
        const batch = fire.batch()

        const ord = ids.slice()
        const ref = listRef()
        ord.splice(index, 0, ref.id)

        batch.update(folderRef(folder), {
          order: ord,
        })

        setTimeout(() => {
          ref.set(obj)
        }, 60)

        batch.commit()
      }
    },
    completeLists(c, lists) {
      const batch = fire.batch()

      for (const l of lists) {
        let calendar = c = l.calendar || null
        if (c && c.type !== 'someday') {
          if (c.type === 'after completion') {
            c.lastCompleteDate = mom().format('Y-M-D')
          }
          else if (c.type === 'daily' || c.type === 'weekly' || c.type === 'monthly' || c.type === 'yearly') {
            const nextEventAfterCompletion = utilsMoment.getNextEventAfterCompletionDate(c)
            c.lastCompleteDate = nextEventAfterCompletion.format('Y-M-D')
          }

          if (c.times) c.times--
          if (c.times === 0) c.times = null
        }

        batch.update(listRef(l.id), {
          completedFire: serverTimestamp(),
          completeDate: mom().format('Y-M-D'),
          fullCompleteDate: mom().format('Y-M-D HH:mm ss'),
          completed: true,
          calendar,
        })

      }
      
      batch.commit()
    },
    uncompleteLists(c, lists) {
      const batch = fire.batch()

      for (const l of lists) {
        const c = l.calendar
        if (c && c.times === 0) c.times = null
        const ref = listRef(l.id)
        batch.update(ref, {
          completedFire: null,
          completeDate: null,
          completed: false,
          calendar: c,
        })
      }

      batch.commit()
    },
    convertHeadingToList({state, getters}, {listId, taskIds, headingId}) {
      const list = getters.getListsById([listId])[0]
      const batch = fire.batch()
      let folder = null
      if (list.folder) folder = list.folder

      const heads = list.headings.slice()
      const i = heads.findIndex(el => el.id === headingId)
      const oldHeading = {...heads[i]}
      heads.splice(i, 1)

      batch.update(listRef(listId), {
        headings: heads,
      })
      
      const newList = listRef()
      batch.set(newList, {
        folder,
        userId: uid(),
        users: [uid()],
        smartViewsOrders: {},
        name: oldHeading.name,
        notes: oldHeading.notes,
        headings: [],
        headingsOrder: [],
        tasks: taskIds,
      })
      for (const id of taskIds)
        batch.update(taskRef(id), {
          list: newList.id,
          heading: null,
        })

      batch.commit()
    },

    // EDIT
    
    saveList(c, list) {
      listRef(list.id).update({
        ...list,
      })
    },
    addListTag(c, {tagId, listId}) {
      listRef(listId).update({
        tags: fd().arrayUnion(tagId),
      })
    },
    removeListTag(c, {tagId, listId}) {
      listRef(listId).update({
        tags: fd().arrayRemove(tagId),
      })
    },
    updateOrder(c, lists) {
      userRef().update({lists})
    },
    updateViewOrder({state}, {view, ids}) {
      const obj = {}
      obj[view] = {}
      obj[view].tasks = ids
      userRef().set({
        viewOrders: obj,
      }, {merge: true})
    },
    sortListsByName({state, dispatch}) {
      const lists = state.lists.slice()
      lists.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
      dispatch('updateOrder', lists.map(el => el.id))
    },

    // TASKS
    
    addTaskByIndexSmartViewFolder(c, {ids, index, task, folderId, viewName, newTaskRef}) {
      const batch = fire.batch()
      
      addTask(batch, {
        userId: uid(),
        createdFire: serverTimestamp(),
        created: mom().format('Y-M-D HH:mm ss'),
        ...task,
      }, newTaskRef).then(() => {
        const views = {}
        views[viewName] = ids
        batch.set(folderRef(folderId), {
          smartViewsOrders: views,
        }, {merge: true})

        batch.commit()
      })
    },
    addTaskByIndexCalendarOrder({rootState}, {ids, index, task, date, newTaskRef}) {
      const batch = fire.batch()
      
      addTask(batch, {
        userId: uid(),
        createdFire: serverTimestamp(),
        created: mom().format('Y-M-D HH:mm ss'),
        ...task,
      }, newTaskRef).then(() => {
        const calendarOrders = utilsTask.getUpdatedCalendarOrders(ids, date, rootState)

        batch.set(userRef(), {calendarOrders}, {merge: true})

        batch.commit()
      })
    },
    addTaskByIndexSmartViewList(c, {ids, index, task, listId, viewName, newTaskRef}) {
      const batch = fire.batch()
      
      addTask(batch, {
        userId: uid(),
        createdFire: serverTimestamp(),
        created: mom().format('Y-M-D HH:mm ss'),
        ...task,
      }, newTaskRef).then(() => {
        const views = {}
        views[viewName] = ids
        batch.set(listRef(listId), {
          smartViewsOrders: views,
        }, {merge: true})

        batch.commit()
      }) 
    },
    addTaskByIndexSmart(c, {ids, index, task, list, newTaskRef}) {
      const batch = fire.batch()
      
      addTask(batch, {
        userId: uid(),
        createdFire: serverTimestamp(),
        created: mom().format('Y-M-D HH:mm ss'),
        ...task,
      }, newTaskRef).then(() => {
        const obj = {[list]: {}}
        // list === viewName, e.g: Today, Tomorrow
        obj[list].tasks = ids
  
        const listRef = userRef()
        batch.set(listRef, {
          viewOrders: obj,
        }, {merge: true})
  
        batch.commit()
      })
    },
    addTaskByIndex(c, {ids, index, task, listId, newTaskRef}) {
      const batch = fire.batch()
      addTask(batch, {
        createdFire: serverTimestamp(),
        created: mom().format('Y-M-D HH:mm ss'),
        userId: uid(),
        ...task,
      }, newTaskRef).then(() => {
        const savedListRef = listRef(listId)
        batch.update(savedListRef, {tasks: ids})
  
        batch.commit()
      })
    },

    uncompleteHeadingTasks({getters}, {headingId, listId, savedTasks}) {
      const list = getters.getListsById([listId])[0]
      const batch = fire.batch()
      
      const head = list.headings.find(el => el.id === headingId)
      const ids = []
      for (const i of head.tasks) {
        const task = savedTasks.find(el => el.id === i)
        if (task) ids.push(task.id)
      }
      for (const id of ids) {
        const ref = taskRef(id)
        batch.update(ref, {
          completeDate: null,
          completed: false,
        })
      }

      batch.commit()
    },
    removeTasksFromSmartViewHeading(c, {taskIds, view, ids}) {
      const batch = fire.batch()

      for (const id of taskIds)
        batch.update(taskRef(id), {
          list: null, folder: null, heading: null,
        })
      const obj = {}
      obj[view] = {}
      obj[view].tasks = ids
      batch.set(userRef(), {
        viewOrders: obj,
      }, {merge: true})

      batch.commit()
    },
    removeTasksFromSmartViewCalendarHeading({rootState}, {taskIds, date, ids}) {
      const batch = fire.batch()

      for (const id of taskIds)
        batch.update(taskRef(id), {
          list: null, folder: null, heading: null,
        })
      
      const calendarOrders = utilsTask.getUpdatedCalendarOrders(ids, date, rootState)

      batch.set(userRef(), {calendarOrders}, {merge: true})

      batch.commit()
    },
    moveTasksToListCalendarOrder({rootState}, {ids, taskIds, date, listId}) {
      const batch = fire.batch()

      for (const id of taskIds)
        batch.update(taskRef(id), {
          list: listId,
          folder: null,
          heading: null,
        })

      const calendarOrders = utilsTask.getUpdatedCalendarOrders(ids, date, rootState)
      
      batch.set(userRef(), {calendarOrders}, {merge: true})

      batch.commit()
    },
    moveTasksToList({getters}, {ids, taskIds, listId, smartView}) {
      const list = getters.getListsById([listId])[0]
      const batch = fire.batch()
      let views = list.smartViewsOrders
      if (!views) views = {}
      views[smartView] = ids

      for (const id of taskIds) {
        batch.update(taskRef(id), {
          list: listId,
          folder: null,
          heading: null,
        })
      }
      batch.update(listRef(listId), {
        smartViewsOrders: views,
      })

      batch.commit()
    },

    // HEADING
    
    addHeading({getters}, {ids, name, headings, listId, index}) {
      const list = getters.getListsById([listId])[0]
      const batch = fire.batch()
      const id = utils.getUid()

      for (const id of ids)
        batch.update(taskRef(id), {
          heading: id,
        })
      const listHeadings = list.headings.slice()
      listHeadings.push({name, tasks: ids, id})
      headings.splice(index, 0, id)
      
      batch.update(listRef(listId), {
        headings: listHeadings,
        headingsOrder: headings,
      })

      batch.commit()
    },
    saveHeadingName({getters}, {listId, headingId, name}) {
      const list = getters.getListsById([listId])[0]
      const batch = fire.batch()
      
      const heads = list.headings.slice()
      const i = heads.findIndex(el => el.id === headingId)
      heads[i].name = name

      batch.update(listRef(listId), {
        headings: heads,
      })

      batch.commit()
    },
    saveHeadingNotes({getters}, {listId, notes, heading}) {
      const list = getters.getListsById([listId])[0]
      const batch = fire.batch()
      
      const heads = list.headings.slice()
      const i = heads.findIndex(el => el.id === heading)
      heads[i].notes = notes
      batch.update(listRef(listId), {
        headings: heads,
      })

      batch.commit()
    },
    moveTasksBetweenHeadings({getters}, {ids, listId, taskIds, headingId}) {
      const list = getters.getListsById([listId])[0]
      const batch = fire.batch()

      for (const id of taskIds)
        batch.update(taskRef(id), {
          heading: headingId,
        })
      const heads = list.headings.slice()
      const i = heads.findIndex(el => el.id === headingId)
      heads[i].tasks = ids
      batch.update(listRef(listId), {
        headings: heads,
      })

      batch.commit()
    },
    removeTasksFromHeading(c, {listId, taskIds, ids}) {
      const batch = fire.batch()

      for (const id of taskIds) {
        const task = taskRef(id)
        batch.update(task, {
          heading: null,
        })
      }
      const savedListRef = listRef(listId)
      batch.update(savedListRef, {
        tasks: ids,
      })

      batch.commit()
    },
    deleteHeadingFromList({getters}, {listId, headingId, savedTasks}) {
      const batch = fire.batch()
      
      const list = getters.getListsById([listId])[0]
      const heads = list.headings.slice()
      const i = heads.findIndex(el => el.id === headingId)
      heads.splice(i, 1)
      
      for (const task of savedTasks) {
        batch.update(taskRef(task.id), {
          heading: null,
        })
      }
      batch.update(listRef(listId), {
        headings: heads,
      })

      batch.commit()
    },
    updateHeadingsTaskIds({getters}, {listId, headingId, ids}) {
      const list = getters.getListsById([listId])[0]
      const heads = list.headings.slice()
      const i = heads.findIndex(el => el.id === headingId)
      heads[i].tasks = ids
      listRef(listId).update({
        headings: heads,
      })
    },
    updateListHeadings(c, {ids, listId}) {
      listRef(listId).update({
        headingsOrder: ids,
      })
    },
    saveSmartViewHeadingTasksOrder({getters}, {ids, listId, smartView}) {
      const list = getters.getListsById([listId])[0]
      let views = list.smartViewsOrders
      if (!views) views = {}
      views[smartView] = ids
      listRef(listId).update({
        smartViewsOrders: views,
      })
    },
    duplicateHeading({getters}, {headingId, name, listId, tasks}) {
      const list = getters.getListsById([listId])[0]
      const batch = fire.batch()
      const newId = utils.getUid()
      const oldHeading = list.headings.find(h => h.id === headingId)

      const newTaskIds = []
      for (const t of tasks) {
        const ref = taskRef()
        batch.set(taskRef(), {
          ...t, heading: newId, id: null,
        })
        newTaskIds.push(ref.id)
      }

      const heads = list.headings.slice()
      heads.push({
        name: oldHeading.name + ' (copy)',
        notes: oldHeading.notes,
        tasks: newTaskIds,
        id: newId,
      })
      const order = list.headingsOrder.slice()
      const i = order.findIndex(n => n === headingId)
      order.splice(i, 0, newId)

      const newListRef = listRef(listId)
      batch.update(newListRef, {
        headingsOrder: order,
        headings: heads,
      })

      batch.commit()
    },
    updateHeadingsViewOrder({state}, {view, ids}) {
      const obj = {}
      obj[view] = {}
      obj[view].headings = ids
      userRef().set({
        viewOrders: obj,
      }, {merge: true})
    },
    updateHeadingsCalendarOrder({rootState}, {date, ids}) {
      const calendarOrders = utilsTask.getUpdatedCalendarOrders(ids, date, rootState, 'headings')

      userRef().set({calendarOrders}, { merge: true })
    },
    addTaskHeading({getters}, {headingId, ids, listId, task, index, newTaskRef}) {
      const list = getters.getListsById([listId])[0]
      const batch = fire.batch()

      task.list = listId
      task.heading = headingId
      batch.set(newTaskRef, {
        userId: uid(),
        createdFire: serverTimestamp(),
        created: mom().format('Y-M-D HH:mm ss'),
        ...task,
      })
      const heads = list.headings.slice()
      const i = heads.findIndex(el => el.id === headingId)
      ids.splice(index, 0, newTaskRef.id)
      heads[i].tasks = ids
      batch.update(listRef(listId), {
        headings: heads,
      })

      batch.commit()
    },

    deleteList({getters}, {listId, tasks}) {
      const batch = fire.batch()
      const list = getters.getListsById([listId])[0]
      let folder = null
      if (list.folder) folder = list.folder

      const ids = []
      for (const t of tasks)
      if (t.list === listId) ids.push(t.id)
      for (const id of ids)
        batch.update(taskRef(id), {
          list: null,
          folder,
          heading: null,
        })

      const deleteListRef = listRef(listId)
      batch.delete(deleteListRef)

      batch.commit()
    },
    importTemplate(c, {list, tasks}) {
      const batch = fire.batch()

      const newListRef = listRef()

      const taskIds = {}
      const listId = newListRef.id
      for (const t of tasks) {
        const ref = taskRef()
        batch.set(ref, {
          ...t, list: listId, id: ref.id, userId: uid(),
          users: [uid()],
        })
        taskIds[t.id] = ref.id
      }

      const heads = list.headings
      for (const h of heads) {
        const newids = []
        for (const id of h.tasks) {
          newids.push(taskIds[id])
        }
        h.tasks = newids
      }
      const newTasks = []
      for (const id of list.tasks)
        newTasks.push(taskIds[id])
      list.tasks = newTasks
      
      list.smartViewsOrders = {}
      batch.set(newListRef, {
        ...list, id: listId, userId: uid(),
        users: [uid()],
      })

      batch.commit()
    },
    deleteAllData({state}) {
      for (const el of state.lists)
        fire.collection('lists').doc(el.id).delete()
      fire.collection('listsOrder').doc(uid()).delete()
      fire.collection('viewOrders').doc(uid()).delete()
    },
  },
}
