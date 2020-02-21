
import { fire, auth } from './index'
import fb from 'firebase/app'

import utils from '../utils'
import utilsTask from "@/utils/task"
import utilsMoment from "@/utils/moment"
import MemoizeGetters from './memoFunctionGetters'
import { listRef, setInfo, uid, listColl, taskRef, fd, setTask, folderRef, setFolder, setList, deleteList, batchSetTasks ,deleteTask, cacheBatchedItems, batchSetLists, setGroup } from '../utils/firestore'
import router from '../router'

import mom from 'moment'

const TOD_DATE = mom().format('Y-M-D')
const TOM_DATE = mom().add(1, 'day').format('Y-M-D')

export default {
  namespaced: true,
  state: {
    lists: {},
    groupLists: {},
  },
  getters: {
    lists(state) {
      const keys = Object.keys(state.lists).filter(
        k => state.lists[k] && !state.lists[k].logbook
      )
      const groupKeys = Object.keys(state.groupLists).filter(
        k => state.groupLists[k] && !state.groupLists[k].logbook
      )

      return keys.map(k => state.lists[k]).concat(groupKeys.map(k => state.groupLists[k]))
    },
    allLists(state) {
      const keys = Object.keys(state.lists).filter(
        k => state.lists[k]
      )
      const groupKeys = Object.keys(state.groupLists).filter(
        k => state.groupLists[k]
      )
      
      return keys.map(k => state.lists[k]).concat(groupKeys.map(k => state.groupLists[k]))
    },
    sortedLists(state, d, {userInfo}, rootGetters) {
      if (userInfo)
        return rootGetters.checkMissingIdsAndSortArr(userInfo.lists, d.lists)
      return []
    },
    logLists(state) {
      const keys = Object.keys(state.lists).filter(
        k => state.lists[k] && state.lists[k].logbook
      )
      const groupKeys = Object.keys(state.groupLists).filter(
        k => state.groupLists[k] && state.groupLists[k].logbook
      )
      
      return keys.map(k => state.lists[k]).concat(groupKeys.map(k => state.groupLists[k]))
    },
    ...MemoizeGetters(null, {
      getTasks({}, tasks, id) {
        return tasks.filter(el => el.list === id)
      },
      isRecurringList: {
        getter({}, list) {
          const c = list.calendar
          return c && c.type !== 'someday' && c.type !== 'specific'
        },
        cache(args) {
          return JSON.stringify(args[0].calendar)
        },
      },
      isListCompleted: {
        getter({}, list, moment) {
          const c = list.calendar
          if (!c || c.type === 'someday' || c.type === 'specific') return list.completed
          
          let tod = mom(moment, 'Y-M-D')
          if (!tod.isValid()) tod = mom(TOD_DATE,' Y-M-D')
          if (c.type === 'after completion') {
            if (!c.lastCompleteDate) return false
            const last = mom(c.lastCompleteDate, 'Y-M-D')
            const dayDiff = tod.diff(last, 'days')
            return dayDiff < c.afterCompletion
          }
      
          if (c.type === 'weekly' || c.type === 'monthly' || c.type === 'yearly' || c.type === 'yearly') {
            return mom(c.lastCompleteDate, 'Y-M-D').isSameOrAfter(tod, 'day')
          }

          return false
        },
        cache(args) {
          let list = args[0]
          const i = {
            completed: list.completed,
            calendar: list.calendar,
          }
          return JSON.stringify({i, a: [args[1], args[2]]})
        },
      },
      isListCanceled: {
        getter({}, list) {
          return list.canceled
        },
        cache(args) {
          return JSON.stringify({
            c: args[0].canceled,
          }) 
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
            if (!c.lastCompleteDate && begins.isSameOrBefore(tod, 'day')) return true
            
            const dayDiff = tod.diff(lastComplete, 'days')
            if (dayDiff < 0) return false
            const eventNotToday = dayDiff < c.afterCompletion
            if (eventNotToday) return false
          }
          
          if (c.type === 'weekly' || c.type === 'monthly' || c.type === 'yearly') {
            return tod.isSameOrAfter(
              utilsMoment.getNextEventAfterCompletionDate(c)
              , 'day')
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
        getter({}, list, l, userInfo) {
          const c = list.calendar
          if (!c) return null
    
          if (c.type === 'specific') {
            const str = utils.getHumanReadableDate(c.specific, l)
            if (str === 'Today') return 'Today'
            if (str === 'Tomorrow') return 'Tomorrow'
            return str
          }
          return utils.parseCalendarObjectToString(c, l, userInfo)
        },
        cache(args) {
          return JSON.stringify({
            c: args[0].calendar,
            u: args[2],
          })
        },
      },
      getListDeadlineStr: {
        getter({getters}, list, date, l) {
          if (!list.deadline)
            return null
          const readable = utils.getHumanReadableDate(list.deadline, l)
          return (readable === 'Today' ? '' : readable) + ' ' + getters.getListDeadlineDaysLeftStr(list.deadline, date)
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
            return 'Ends today'
          else if (diff === 1)
            return `1 day left`
          else if (diff < 0) {
            if (Math.abs(diff) === 1)
              return '1 day ago'
            return `${Math.abs(diff)} days ago`
          }
          return `${diff} days left`
        },
        cache(args) {
          return JSON.stringify(args)
        }
      },
      getCalendarOrderSmartViewListsOrder: {
        getter(c) {
          const taskIdsFromList = this.getAllTasksOrderByList(list.id)

          let found = false
          for (const id of calendarOrder)
            if (taskIdsFromList.includes(id)) {
              found = true
              break
            }

          if (found) tasksOrder = calendarOrder
          else tasksOrder = taskIdsFromList
        },
        cache(args) {

        },
      },
      isListLastDeadlineDay: {
        getter({}, list, date) {
          if (!list.deadline || list.completed || list.canceled)
            return false
          return list.deadline === (date || TOD_DATE)
        },
        cache(args) {
          return JSON.stringify({
            d: args[0].deadline,
            c: args[0].completed,
            ca: args[0].canceled,
            da: args[1],
          })
        },
      },
      isListBeginDay: {
        getter({}, list, date) {
          if (!list.calendar || list.completed || list.canceled || list.calendar.type !== 'specific')
            return false
          return list.calendar.specific === (date || TOD_DATE)
        },
        cache(args) {
          return JSON.stringify({
            c: args[0].completed,
            ca: args[0].canceled,
            c: args[0].calendar,
            da: args[1],
          })
        },
      },
      isLaterList: {
        getter(c, list) {
          return list.calendar && list.calendar.type === 'specific' && mom(list.calendar.specific, 'Y-M-D').isAfter(mom(TOD_DATE, 'Y-M-D'), 'day')
        },
        cache(args) {
          return JSON.stringify(args[0].calendar)
        },
      },
    }),
    ...MemoizeGetters('lists', {
      getEndsTodayLists: {
        react: [
          'deadline',
          'completed',
          'canceled',
          'assigned',
        ],
        getter({getters}, date) {
          return getters.lists.filter(l => getters.isListLastDeadlineDay(l, date))
        },
        cache(args) {
          return JSON.stringify(args[0])
        },
      },
      getListHeadingsById: {
        react: [
          'headings'
        ],
        getter({getters}, id) {
          return getters.lists.find(el => el.id === id).headings
        },
      },
      getLaterLists: {
        react: [
          'calendar',
        ],
        getter({getters}) {
          return getters.lists.filter(getters.isLaterList)
        },
      },
      getBeginsTodayLists: {
        react: [
          'completed',
          'canceled',
          'calendar',
        ],
        getter({getters}, date) {
          return getters.lists.filter(l => getters.isListBeginDay(l, date))
        },
        cache(args) {
          return JSON.stringify(args[0])
        },
      },
      isListAnytime: {
        getter({}, list) {
          return !utilsTask.hasCalendarBinding(list)
        },
        cache(args) {
          const t = args[0]
          return JSON.stringify({
            l: t.list, f: t.folder, t: t.tags,
            c: t.calendar,
          })
        },
      },
      isListInView: {
        getter({getters}, list, view) {
          switch (view) {
            case 'Someday': return getters.isListSomeday(list)
            case 'Anytime': return getters.isListAnytime(list)
          }
        },
        cache(args) {
          const view = args[1]
          const t = args[0]
          let obj = {}

          switch (view) {
            case 'Anytime': {
              obj = {
                calendar: t.calendar,
                list: t.list,
                folder: t.folder,
                tags: t.tags,
              }
              break
            }
            case 'Someday': {
              obj = t.calendar
              break
            }
          }

          return JSON.stringify({obj, view})
        },
      },
      getListsByName: {
        react: [
          'name',
        ],
        getter({getters}, names) {
          const arr = []
          for (const n of names) {
            const list = getters.lists.find(el => el.name === n)
            if (list) arr.push(list)
          }
          return arr
        },
      },
      getListsById({getters}, ids) {
        const arr = []
        for (const id of ids) {
          let list = getters.allLists.find(el => el.id === id)
          if (list) arr.push(list)
        }
        return arr
      },
      getListByName: {
        react: ['name'],
        getter({getters}, name) {
          return getters.lists.find(l => l.name && l.name.trim() === name)
        },
      },
      filterSidebarLists: {
        react: [
          'completed',
          'canceled',
          'folder',
          'calendar',
          'group',
          'assigned',
        ],
        getter({getters}, lists) {
          return lists.filter(l =>
              !getters.isListCompleted(l) &&
              !getters.isListCanceled(l) &&
              !getters.isListSomeday(l) &&
              getters.isListShowingOnDate(l, TOD_DATE)
            )
        },
        cache(args) {
          return JSON.stringify({
            c: args[0].map(el => ({
              c: el.completed,
              ca: el.canceled,
              f: el.folder,
              ass: el.assigned,
              cab: el.calendar,
              g: el.group
            }))
          })
        },
      },
      getAllTasksOrderByList: {
        react: [
          'headingsOrder',
          'headings',
          'tasks',
        ],
        getter({getters, rootGetters}, listId) {
          const list = getters.lists.find(el => el.id === listId)
          let ord = (list.tasks && list.tasks.slice()) || []
          
          let headsOrder = list.headingsOrder.slice() || []
    
          const heads = rootGetters.checkMissingIdsAndSortArr(headsOrder, list.headings)
          
          for (const h of heads) {
            ord = [...ord, ...h.tasks]
          }
          
          return ord
        },
      },
      pieProgress({getters, state}, tasks, listId, isTaskCompleted) {
        const list = getters.lists.find(el => el.id === listId)
        if (list) {
          const c = list.calendar
          const ts = getters.getTasks(tasks, listId)
          const numberOfTasks = ts.length
          let completedTasks = 0
          
          let compareDate = null
          if (c && c.lastCompleteDate)
            compareDate = c.lastCompleteDate
    
          ts.forEach(el => {
            if (isTaskCompleted(el, TOD_DATE, compareDate)) completedTasks++
          })
          const result = 100 * completedTasks / numberOfTasks
          if (isNaN(result)) return 0
          return result
        }
        return 0
      },
    }, true),
    getFavoriteLists(s, getters) {
      return getters.lists.filter(el => el.favorite).map(f => ({...f, icon: 'tasks', color: 'var(--primary)', type: 'list'}))
    },
  },
  actions: {
    // ADD

    duplicateList({rootState}, {list, rootTasks, headingTasks}) {
      const b = fire.batch()

      const name = list.name + ' (copy)'
      const newListRef = listRef()

      const writes = []

      let group = null
      if (list.group)
        group = list.group

      const createTasks = (arr, tasks) => {
        for (const t of tasks) {
          const ref = taskRef()
          setTask(b, {
            ...t, id: null, list: newListRef.id,
            group,
            createdFire: new Date(),
            created: mom().format('Y-M-D HH:mm ss'),
          }, rootState, ref.id, writes)
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

      setList(b, {
        headingsOrder,
        headings,
        name,
        group,
        folder: list.folder || null,
        createdFire: new Date(),
        created: mom().format('Y-M-D HH:mm ss'),
        deadline: list.deadline || null,
        tags: list.tags || [],
        calendar: list.calendar || null,
        notes: list.notes || null,
        tasks: newRootTasks.map(t => t.newId),
        userId: uid(),
      }, newListRef.id, rootState, writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },
    addListInFolderByIndexFromView({rootState}, {list, newItemRef, ids, folderId}) {
      const b = fire.batch()

      const writes = []

      setFolder(b, {order: ids}, folderId, rootState, writes)

      list.folder = folderId

      setList(b, list, newItemRef.id, rootState, writes)

      cacheBatchedItems(b, writes)
      
      b.commit()
    },
    addListInFolderByIndex({rootState}, {ids, item, newItemRef}) {
      const b = fire.batch()

      const writes = []
      
      setFolder(b, {order: ids}, item.folder, rootState, writes)

      setList(b, {
        ...item,
        smartViewsOrders: {},
        headings: [],
        headingsOrder: [],
        tasks: [],
      }, newItemRef.id, rootState, writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },
    unlogLists({rootState}, lists) {
      const b = fire.batch()

      const writes = []

      batchSetLists(b, {
        logbook: false,
        logFire: fd().delete(),
        logDate: fd().delete(),
        fullLogDate: fd().delete(),
      }, lists, rootState, writes)

      cacheBatchedItems(b, writes)
      
      b.commit()
    },
    logLists({rootState}, lists) {
      const b = fire.batch()

      const writes = []

      batchSetLists(b, {
        logbook: true,
        logFire: new Date(),
        logDate: mom().format('Y-M-D'),
        fullLogDate: mom().format('Y-M-D HH:mm ss'),
      }, lists, rootState, writes)

      cacheBatchedItems(b, writes)
      
      b.commit()
    },
    addListInGroupByIndex({rootState}, {ids, item, newItemRef}) {
      const b = fire.batch()

      const writes = []
      item.group = item.folder
      item.folder = null
      
      setGroup(b, {listsOrder: ids}, item.group, rootState, writes)

      setList(b, {
        ...item,
        smartViewsOrders: {},
        headings: [],
        headingsOrder: [],
        tasks: [],
      }, newItemRef.id, rootState, writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },
    addListInRootByIndex({rootState}, {ids, item, newItemRef}) {
      const b = fire.batch()

      const writes = []
      
      setList(b, {
        ...item,
        smartViewsOrders: {},
        headings: [],
        headingsOrder: [],
        tasks: [],
      }, newItemRef.id, rootState, writes)
      setInfo(b, {
        lists: ids,
      }, writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },
    addList({rootState}, {name, ids, index, folderId}) {
      const b = fire.batch()
      
      let folder = folderId
      if (!folder) folder = null
      const obj = {
        name, folder,
        smartViewsOrders: {},
        userId: uid(),
        createdFire: new Date(),
        created: mom().format('Y-M-D HH:mm ss'),
        headings: [],
        headingsOrder: [],
        tasks: [],
      }
      if (index === undefined && folder === null) {
        setList(b, obj, undefined, rootState)
        b.commit()
      }
    },
    completeLists({rootState}, lists) {
      const b = fire.batch()

      const writes = []

      for (const l of lists) {
        let calendar = l.calendar || null
        let c = calendar
        if (c && c.type !== 'someday') {
          if (c.type === 'after completion') {
            c.lastCompleteDate = mom().format('Y-M-D')
          }
          else if (c.type === 'weekly' || c.type === 'monthly' || c.type === 'yearly') {
            const nextEventAfterCompletion = utilsMoment.getNextEventAfterCompletionDate(c, true)
            c.lastCompleteDate = nextEventAfterCompletion.format('Y-M-D')
          }

          if (c.times) c.times--
          if (c.times === 0) c.times = null
        }

        const tod = mom()
        const obj = {
          completedFire: new Date(),
          completeDate: tod.format('Y-M-D'),
          checkDate: tod.format('Y-M-D'),
          fullCheckDate: tod.format('Y-M-D HH:mm ss'),
          fullCompleteDate: tod.format('Y-M-D HH:mm ss'),
          completed: true,
          canceled: false,
          cancelDate: null,
          fullCancelDate: null,
          calendar,
        }

        const isNotRecurringList = !c || (c.type == 'someday' || c.type === 'specific')

        if (!rootState.userInfo.manuallyLogTasks && isNotRecurringList) {
          obj = {
            ...obj,
            logbook: true,
            logFire: new Date(),
            logDate: mom().format('Y-M-D'),
            fullLogDate: mom().format('Y-M-D HH:mm ss'),
          }
        }
        
        setList(b, obj, l.id, rootState, writes)
      }

      cacheBatchedItems(b, writes)
      
      b.commit()
    },
    uncompleteLists({rootState}, lists) {
      const b = fire.batch()

      const writes = []
      
      for (const l of lists) {
        const c = l.calendar
        if (c && c.times === 0) c.times = null
        if (c) {
          c.lastCompleteDate = null
        }
        setList(b, {
          completedFire: null,
          completeDate: null,
          completed: false,
          checkDate: null,
          fullCheckDate: null,
          calendar: c,
        }, l.id, rootState, writes)
      }

      cacheBatchedItems(b, writes)

      b.commit()
    },
    async cancelLists({rootState}, ids) {
      const b = fire.batch()

      const tod = mom()
      await batchSetLists(b, {
        canceled: true,
        cancelDate: tod.format('Y-M-D'),
        checkDate: tod.format('Y-M-D'),
        fullCancelDate: tod.format('Y-M-D HH:mm ss'),
        fullCheckDate: tod.format('Y-M-D HH:mm ss'),
        completedFire: null,
        completeDate: null,
        completed: false,
      }, ids, rootState)

      b.commit()
    },
    async uncancelLists({rootState}, ids) {
      const b = fire.batch()

      await batchSetLists(b, {
        canceled: false,
        cancelDate: null,
        checkDate: null,
        fullCancelDate: null,
        fullCheckDate: null,
      }, ids, rootState)

      b.commit()
    },
    convertHeadingToList({rootState, getters}, {listId, taskIds, headingId}) {
      const list = getters.getListsById([listId])[0]
      const b = fire.batch()

      const writes = []
      
      let folder = null
      let group = null
      
      if (list.folder) folder = list.folder
      if (list.group) group = list.group

      const heads = list.headings.slice()
      const i = heads.findIndex(el => el.id === headingId)
      const oldHeading = {...heads[i]}
      heads.splice(i, 1)

      setList(b, {
        headings: heads,
      }, listId, rootState)
      
      const newList = listRef()
      setList(b, {
        folder,
        group,
        smartViewsOrders: {},
        name: oldHeading.name,
        notes: oldHeading.notes || null,
        headings: [],
        createdFire: new Date(),
        created: mom().format('Y-M-D HH:mm ss'),
        headingsOrder: [],
        tasks: taskIds,
      }, newList.id, rootState, writes)
      for (const id of taskIds)
        setTask(b, {
          group,
          list: newList.id,
          heading: null,
        }, rootState, id, writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },

    // EDIT
    
    saveList({rootState}, list) {
      const b = fire.batch()
      
      setList(b, list, list.id, rootState)

      b.commit()
    },
    saveListsById({rootState}, {list, ids}) {
      const b = fire.batch()

      const writes = []
      
      ids.forEach(id => setList(b, list, id, rootState, writes))

      cacheBatchedItems(b, writes)

      b.commit()
    },
    editListTags({rootState}, {tagIds, listId}) {
      const b = fire.batch()
      
      setList(b, {
        tags: tagIds,
      }, listId, rootState)
  
      b.commit()
    },
    removeListTag({rootState}, {tagId, list}) {
      const b = fire.batch()

      const tags = list.tags.slice()

      const i = tags.indexOf(tagId)
      tags.splice(i, 1)
      
      setList(b, {
        tags,
      }, list.id, rootState)
  
      b.commit()
    },
    updateOrder(c, lists) {
      const b = fire.batch()
      
      setInfo(b, {lists})

      b.commit()
    },
    updateViewOrder({state}, {view, ids}) {
      const obj = {}
      obj[view] = {}
      obj[view].tasks = ids
      const b = fire.batch()
      
      setInfo(b, {
        viewOrders: obj,
      })

      b.commit()
    },
    sortListsByName({getters, dispatch}) {
      const lists = getters.lists.slice()
      lists.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
      dispatch('updateOrder', lists.map(el => el.id))
    },

    // TASKS
    
    async addTaskByIndexSmartViewFolder({rootState}, {ids, index, task, folderId, viewName, newTaskRef}) {
      const b = fire.batch()

      const writes = []
      
      await setTask(b, {
        userId: uid(),
        createdFire: new Date(),
        created: mom().format('Y-M-D HH:mm ss'),
        ...task,
      }, rootState, newTaskRef.id, writes)
    
      const views = {}
      views[viewName] = ids

      setFolder(b, {smartViewsOrders: views}, folderId, rootState, writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },
    async addTaskByIndexSmartViewGroup({rootState}, {ids, index, task, groupId, viewName, newTaskRef}) {
      const b = fire.batch()

      const writes = []
      
      await setTask(b, {
        userId: uid(),
        createdFire: new Date(),
        created: mom().format('Y-M-D HH:mm ss'),
        ...task,
      }, rootState, newTaskRef.id, writes)
    
      setGroup(b, {
        smartViewsOrders: {
          [viewName]: {
            [uid()]: ids
          },
        },
      }, groupId, rootState, writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },
    async addTaskByIndexCalendarOrder({rootState}, {ids, index, task, date, newTaskRef}) {
      const b = fire.batch()
      
      const writes = []
      
      await setTask(b, {
        userId: uid(),
        createdFire: new Date(),
        created: mom().format('Y-M-D HH:mm ss'),
        ...task,
      }, rootState, newTaskRef.id, writes)
    
      const calendarOrders = utilsTask.getUpdatedCalendarOrders(ids, date, rootState)

      setInfo(b, {calendarOrders}, writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },
    addListByIndexCalendarOrder({rootState}, {ids, list, date, newListRef}) {
      const b = fire.batch()

      const writes = []

      setList(b, {
        name: '',
        smartViewsOrders: {},
        userId: uid(),
        createdFire: new Date(),
        created: mom().format('Y-M-D HH:mm ss'),
        headings: [],
        headingsOrder: [],
        tasks: [],
        ...list,
      }, newListRef.id, rootState, writes)

      const calendarOrders = utilsTask.getUpdatedCalendarOrders(ids, date, rootState)

      setInfo(b, {calendarOrders}, writes)

      cacheBatchedItems(b, writes)
      
      b.commit()
    },
    addTaskByIndexSmartViewList({rootState}, {ids, index, task, listId, viewName, newTaskRef}) {
      const b = fire.batch()

      const writes = []
      
      setTask(b, {
        userId: uid(),
        createdFire: new Date(),
        created: mom().format('Y-M-D HH:mm ss'),
        ...task,
      }, rootState, newTaskRef.id, writes)
      const views = {}
      views[viewName] = ids

      setList(b, {
        smartViewsOrders: views,
      }, listId, rootState, writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },
    addTaskByIndexSmart({rootState}, {ids, index, task, list, newTaskRef}) {
      const b = fire.batch()

      const writes = []
      
      setTask(b, {
        userId: uid(),
        createdFire: new Date(),
        created: mom().format('Y-M-D HH:mm ss'),
        ...task,
      }, rootState, newTaskRef.id, writes)
      const obj = {[list]: {}}
      // list === viewName, e.g: Today, Tomorrow
      obj[list].tasks = ids

      setInfo(b, {
        viewOrders: obj,
      }, writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },
    addTaskByIndex({rootState}, {ids, index, task, listId, newTaskRef}) {
      const b = fire.batch()

      const writes = []
      
      setTask(b, {
        createdFire: new Date(),
        created: mom().format('Y-M-D HH:mm ss'),
        userId: uid(),
        ...task,
      }, rootState, newTaskRef.id, writes)

      setList(b, {tasks: ids}, listId, rootState, writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },

    uncompleteHeadingTasks({getters, rootState}, {headingId, listId, savedTasks}) {
      const list = getters.getListsById([listId])[0]
      const b = fire.batch()

      const writes = []
      
      const head = list.headings.find(el => el.id === headingId)
      const ids = []
      
      for (const i of head.tasks) {
        const task = savedTasks.find(el => el.id === i)
        if (task) ids.push(task.id)
      }

      batchSetTasks(b, {
        completedFire: null,
        completeDate: null,
        completed: false,
      }, ids, rootState, writes)
      
      cacheBatchedItems(b, writes)

      b.commit()
    },
    removeTasksFromSmartViewHeading({rootState}, {taskIds, view, ids}) {
      const b = fire.batch()

      const writes = []

      batchSetTasks(b, {
        list: null, folder: null, heading: null, group: null,
      }, taskIds, rootState, writes)

      const obj = {}
      obj[view] = {}
      obj[view].tasks = ids
      setInfo(b, {
        viewOrders: obj,
      }, writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },
    removeTasksFromSmartViewCalendarHeading({rootState}, {taskIds, date, ids}) {
      const b = fire.batch()

      const writes = []

      batchSetTasks(b, {
        list: null, folder: null, heading: null, group: null,
      }, taskIds, rootState, writes)
      
      const calendarOrders = utilsTask.getUpdatedCalendarOrders(ids, date, rootState)

      setInfo(b, {calendarOrders}, writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },
    moveTasksToListCalendarOrder({rootState, getters}, {ids, taskIds, date, listId}) {
      const b = fire.batch()
      const list = getters.getListsById([listId])[0]

      let obj
      if (list.group)
        obj = {
          list: listId,
          group: list.group,
          folder: null,
          heading: null,
        }
      else
        obj = {
          list: listId,
          group: null,
          folder: null,
          heading: null,
        }

      batchSetTasks(b, obj, taskIds, rootState, writes)

      const calendarOrders = utilsTask.getUpdatedCalendarOrders(ids, date, rootState)
      
      setInfo(b, {calendarOrders}, writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },
    moveTasksToList({getters, rootState}, {ids, taskIds, listId, smartView}) {
      const list = getters.getListsById([listId])[0]
      const b = fire.batch()
      let views = list.smartViewsOrders
      if (!views) views = {}
      views[smartView] = ids

      const writes = []

      let obj
      if (list.group)
        obj = {
          list: listId,
          group: list.group,
          folder: null,
          heading: null,
        }
      else
        obj = {
          list: listId,
          group: null,
          folder: null,
          heading: null,
        }
      
      batchSetTasks(b, obj, taskIds, rootState, writes)

      setList(b, {
        smartViewsOrders: views,
      }, listId, rootState, writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },

    // HEADING
    
    addHeading({getters, rootState}, {ids, name, headings, listId, index}) {
      const list = getters.getListsById([listId])[0]
      const b = fire.batch()
      const headindgId = utils.getUid()

      const writes = []

      batchSetTasks(b, {
        heading: headindgId,
      }, ids, rootState, writes)

      const listHeadings = list.headings.slice()
      listHeadings.push({name, tasks: ids, id: headindgId})
      headings.splice(index, 0, headindgId)
      
      setList(b, {
        headings: listHeadings,
        headingsOrder: headings,
      }, listId, rootState, writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },
    saveHeadingName({getters, rootState}, {listId, headingId, name}) {
      const list = getters.getListsById([listId])[0]
      const b = fire.batch()
      
      const heads = list.headings.slice()
      const i = heads.findIndex(el => el.id === headingId)
      heads[i].name = name

      setList(b, {headings: heads}, listId, rootState)

      b.commit()
    },
    saveHeadingNotes({getters, rootState}, {listId, notes, heading}) {
      const list = getters.getListsById([listId])[0]
      const b = fire.batch()
      
      const heads = list.headings.slice()
      const i = heads.findIndex(el => el.id === heading)
      heads[i].notes = notes
      setList(b, {
        headings: heads,
      }, listId, rootState)

      b.commit()
    },
    moveTasksBetweenHeadings({getters, rootState}, {ids, listId, taskIds, headingId}) {
      const list = getters.getListsById([listId])[0]
      const b = fire.batch()

      const writes = []
      
      batchSetTasks(b, {
        heading: headingId,
      }, taskIds, rootState, writes)

      const heads = list.headings.slice()
      const i = heads.findIndex(el => el.id === headingId)
      heads[i].tasks = ids
      setList(b, {headings: heads}, listId, rootState, writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },
    removeTasksFromHeading({rootState}, {listId, taskIds, ids}) {
      const b = fire.batch()

      const writes = []
      
      batchSetTasks(b, {
        heading: null,
      }, taskIds, rootState, writes)

      setList(b, {tasks: ids}, listId, rootState, writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },
    deleteHeadingFromList({getters, rootState}, {listId, headingId, savedTasks}) {
      const b = fire.batch()
      
      const list = getters.getListsById([listId])[0]
      const heads = list.headings.slice()
      const i = heads.findIndex(el => el.id === headingId)
      heads.splice(i, 1)
      
      const writes = []
      
      batchSetTasks(b, {
        heading: null,
      }, savedTasks.map(el => el.id), rootState, writes)

      setList(b, {headings: heads}, listId, rootState, writes)

      cacheBatchedItems(b, writes)
      
      b.commit()
    },
    updateHeadingsTaskIds({getters, rootState}, {listId, headingId, ids}) {
      const list = getters.getListsById([listId])[0]
      const heads = list.headings.slice()
      const i = heads.findIndex(el => el.id === headingId)
      heads[i].tasks = ids
      const b = fire.batch()
      
      setList(b, {headings: heads}, listId, rootState)

      b.commit()
    },
    updateListHeadings({rootState}, {ids, listId}) {
      const b = fire.batch()
      
      setList(batch, {headingsOrder: ids}, listId, rootState)

      b.commit()
    },
    saveSmartViewHeadingTasksOrder({getters, rootState}, {ids, listId, smartView}) {
      const list = getters.getListsById([listId])[0]
      let views = list.smartViewsOrders
      if (!views) views = {}
      views[smartView] = ids
      const b = fire.batch()
      
      setList(b, {
        smartViewsOrders: views,
      }, listId, rootState)

      b.commit()
    },
    saveListsSmartViewOrderListIds(c, {ids, viewName}) {
      const b = fire.batch()

      setInfo(b, {
        viewOrders: {
          [viewName]: {
            lists: ids
          },
        },
      })

      b.commit()
    },
    addListByIndexSmartViewOrderListIds({rootState}, {list, newItemRef, ids, viewName}) {
      const b = fire.batch()
      
      const writes = []

      setList(b, {
        folder: null,
        group: null,
        name: '',
        smartViewsOrders: {},
        userId: uid(),
        createdFire: new Date(),
        created: mom().format('Y-M-D HH:mm ss'),
        headings: [],
        headingsOrder: [],
        tasks: [],
        userId: uid(),
        ...list,
      }, newItemRef.id, rootState, writes)
      
      setInfo(b, {
        viewOrders: {
          [viewName]: {
            lists: ids
          },
        },
      }, writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },
    duplicateHeading({getters, rootState}, {headingId, name, listId, tasks}) {
      const list = getters.getListsById([listId])[0]
      const b = fire.batch()
      const newId = utils.getUid()
      const oldHeading = list.headings.find(h => h.id === headingId)

      const writes = []

      const newTaskIds = []

      for (const t of tasks) {
        setTask(b, {
          ...t, heading: newId, id: null,
        }, rootState, undefined, writes)
        newTaskIds.push(t.id)
      }

      const heads = list.headings.slice()
      heads.push({
        name: oldHeading.name + ' (copy)',
        notes: oldHeading.notes || '',
        tasks: newTaskIds,
        id: newId,
      })
      const order = list.headingsOrder.slice()
      const i = order.findIndex(n => n === headingId)
      order.splice(i, 0, newId)

      setList(b, {
        headingsOrder: order,
        headings: heads,
      }, listId, rootState, writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },
    updateHeadingsViewOrder({}, {view, ids}) {
      const obj = {}
      obj[view] = {}
      obj[view].headings = ids
      const b = fire.batch()
      
      setInfo(b, {
        viewOrders: obj,
      })

      b.commit()
    },
    updateHeadingsCalendarOrder({rootState}, {date, ids}) {
      const calendarOrders = utilsTask.getUpdatedCalendarOrders(ids, date, rootState, 'headings')
      const b = fire.batch()

      setInfo(b, {calendarOrders})

      b.commit()
    },
    addTaskHeading({getters, rootState}, {headingId, ids, listId, task, index, newTaskRef}) {
      const list = getters.getListsById([listId])[0]
      const b = fire.batch()

      const writes = []
      
      task.list = listId
      task.heading = headingId
      setTask(b, {
        userId: uid(),
        createdFire: new Date(),
        created: mom().format('Y-M-D HH:mm ss'),
        ...task,
      }, rootState, newTaskRef.id, writes)
      const heads = list.headings.slice()
      const i = heads.findIndex(el => el.id === headingId)
      ids.splice(index, 0, newTaskRef.id)
      heads[i].tasks = ids
      setList(b, {
        headings: heads,
      }, listId, rootState, writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },

    deleteList({getters, rootState}, {listId, tasks}) {
      const b = fire.batch()
      const list = getters.getListsById([listId])[0]
      let folder = null
      if (list.folder) folder = list.folder

      const writes = []

      const ids = []
      for (const t of tasks)
      if (t.list === listId) ids.push(t.id)
      batchSetTasks(b, {
        list: null,
        folder,
        group: list.group || null,
        heading: null,
      }, ids, rootState, writes)

      deleteList(b, listId, rootState, writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },
    deleteMultipleListsByIds({getters, rootState, rootGetters}, ids) {
      const b = fire.batch()

      const tasks = rootGetters['task/allTasks']

      const writes = []

      ids.forEach(id => {

        const list = getters.getListsById([id])[0]
        let folder = null
        if (list.folder) folder = list.folder

        const taskIds = []
        tasks.forEach(el => {
          if (el.list === id) taskIds.push(el.id)
        })
        batchSetTasks(b, {
          list: null,
          group: list.group || null,
          folder,
          heading: null,
        }, taskIds, rootState, writes)

        deleteList(b, id, rootState, writes)
        
      })

      cacheBatchedItems(b, writes)

      b.commit()
    },
    importTemplate({rootState}, {list, tasks}) {
      const b = fire.batch()

      const newListRef = listRef()

      const writes = []
      
      const taskIds = {}
      const listId = newListRef.id
      for (const t of tasks) {
        setTask(b, {
          ...t, list: listId, id: ref.id, userId: uid(),
          users: [uid()],
        }, rootState, undefined, writes)
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
      setList(b, {
        ...list, id: listId, userId: uid(),
        users: [uid()],
      }, newListRef.id, rootState, writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },
  },
}
