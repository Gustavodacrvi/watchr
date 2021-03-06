
import { fire, auth } from './index'
import fb from 'firebase/app'

import Vue from 'vue'

import utils from '../utils'
import utilsTask from "@/utils/task"
import utilsList from "@/utils/list"
import utilsMoment from "@/utils/moment"
import MemoizeGetters from './memoFunctionGetters'
import { listRef, setInfo, uid, listColl, taskRef, fd, setTask, folderRef, setFolder, setList, deleteList, batchSetTasks ,deleteTask, cacheBatchedItems, batchSetLists, setGroup } from '../utils/firestore'

import mom from 'moment'

const TODAY_MOM = mom()

const TOD_DATE = TODAY_MOM.format('Y-M-D')
const TOM_DATE = mom().add(1, 'day').format('Y-M-D')

export default {
  namespaced: true,
  state: {
    lists: {},
    groupLists: {},
  },
  getters: {
    lists(state, getters) {
      const keys = Object.keys(state.lists).filter(
        k => state.lists[k] && !getters.isListInLogbook(state.lists[k])
      )
      const groupKeys = Object.keys(state.groupLists).filter(
        k => state.groupLists[k] && !getters.isListInLogbook(state.groupLists[k])
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
    sortedListsByName(s, getters) {
      const lists = getters.lists.slice()
      lists.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
      return lists
    },
    sortedLists(s, d, {userInfo}, rootGetters) {
      if (userInfo)
        return rootGetters.checkMissingIdsAndSortArr(userInfo.lists, d.lists)
      return []
    },
    logLists(state, getters) {
      const keys = Object.keys(state.lists).filter(
        k => state.lists[k] && getters.isListInLogbook(state.lists[k])
      )
      const groupKeys = Object.keys(state.groupLists).filter(
        k => state.groupLists[k] && getters.isListInLogbook(state.groupLists[k])
      )
      
      return keys.map(k => state.lists[k]).concat(groupKeys.map(k => state.groupLists[k]))
    },
    filteredSidebarLists(s, getters, a, rootGetters) {
      return utilsList.filterSidebarLists(rootGetters, getters.sortedLists)
    },

    isListCanceled: () => l => l.canceled,
    isListSomeday: () => l => l.calendar && l.calendar.type === 'someday',
    isListAnytime: () => l => !l.calendar,
    isRecurringList: () => l => l.calendar && l.calendar.type !== 'someday' && l.calendar.type !== 'specific',

    
    ...MemoizeGetters({
      getTasks: {
        deepGetterTouch: {
          'task/allTasks': [
            'group',
            'list',
            'heading',
            'folder',
          ],
        },
        getter({}, id) {
          return this['task/allTasks'].filter(el => el.list === id)
        },
        cache(args) {
          return args[0]
        },
      },
      isListInLogbook: {
        getter({getters}, list) {
          const { logbook, calendar } = list

          const c = calendar

          if (!c || !getters.isRecurringList(list))
            return logbook
          
          if (c.ends) {
            if (c.ends.type === 'on date' && TODAY_MOM.isAfter(mom(c.ends.onDate, 'Y-M-D'), 'day'))
              return true
            else if (c.ends.times === 0)
              return true
          }
        },
        cache(args) {
          return JSON.stringify({
            c: args[0].calendar,
            l: args[0].logbook
          })
        },
      },
      isListCompleted: {
        getter({getters}, list, moment) {
          const c = list.calendar
          if (!c || !getters.isRecurringList(list)) return list.completed
          
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
      isListShowingOnDate: {
        getter({}, list, date) {
          if (!utilsTask.hasCalendarBinding(list) || list.calendar.type === 'someday' || list.calendar.type === 'anytime')
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
            else if (c.ends.times === 0)
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
        getter({}, list, date = TOD_DATE) {
          const c = list.calendar
          if (!c || c.type === 'someday' || c.type === 'anytime')
            return false
          if (c.type === 'specific')
            return c.specific === date
          return utilsMoment.getNextEventAfterCompletionDate(c)
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
      isListInView: {
        getter({getters, rootState}, list, view) {
          switch (view) {
            case 'Someday': return getters.isListSomeday(list)
            case 'Anytime': return getters.isListAnytime(list)
            case 'Today': return getters.isListOnCalendarView(list, TOD_DATE)
            case 'Tomorrow': return getters.isListOnCalendarView(list, TOM_DATE)
            case 'Deadlines': return list.deadline
            case 'Assigned to me': return list.assigned === rootState.user.uid
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
            case 'Tomorrow': {
              obj = {
                c: t.calendar,
                d: t.deadline,
              }
              break
            }
            case 'Today': {
              obj = {
                c: t.calendar,
                d: t.deadline,
              }
              break
            }
            case 'Deadlines': {
              obj = {
                c: t.deadline
              }
              break
            }
            case 'Someday': {
              obj = t.calendar
              break
            }
            case 'Assigned to me': {
              obj = {
                a: t.assigned
              }
              break
            }
          }

          return JSON.stringify({obj, view})
        },
      },
      isListOnCalendarView: {
        getter({getters}, list, date = TOD_DATE) {
          if (list.deadline === date)
            return true
          return getters.isListBeginDay(list, date)
        },
        cache(args) {
          return JSON.stringify({
            c: args[0].calendar,
            e: args[0].deadline,
            d: args[1],
          })
        },
      },
    }),
    ...MemoizeGetters({
      getEndsTodayLists: {
        deepGetterTouch: {
          'list/lists': [
            'deadline',
            'completed',
            'canceled',
            'assigned',
          ]
        },
        getter({getters}, date) {
          return this['list/lists'].filter(l => getters.isListLastDeadlineDay(l, date))
        },
        cache(args) {
          return args[0]
        },
      },
      getListHeadingsById: {
        deepGetterTouch: {
          'list/lists': [
            'headings',
          ],
        },
        getter({}, id) {
          return this['list/lists'].find(el => el.id === id).headings
        },
      },
      getLaterLists: {
        deepGetterTouch: {
          'list/lists': [
            'calendar',
          ],
        },
        getter({getters}) {
          return this['list/lists'].filter(getters.isLaterList)
        },
      },
      getBeginsTodayLists: {
        deepGetterTouch: {
          'list/lists': [
            'completed',
            'canceled',
            'calendar',
          ]
        },
        getter({getters}, date) {
          return this['list/lists'].filter(l => getters.isListBeginDay(l, date))
        },
        cache(args) {
          return args[0]
        },
      },
      getListsByName: {
        deepGetterTouch: {
          'list/lists': [
            'name',
          ],
        },
        getter({}, names) {
          const arr = []
          for (const n of names) {
            const list = this['list/lists'].find(el => el.name === n)
            if (list) arr.push(list)
          }
          return arr
        },
      },
      getListsById: {
        touchGetters: [
          'list/allLists',
        ],
        getter({}, ids) {
          const arr = []
          for (const id of ids) {
            let list = this['list/allLists'].find(el => el.id === id)
            if (list) arr.push(list)
          }
          return arr
        },
      },
      getAllTasksOrderByList: {
        deepGetterTouch: {
          'list/lists': [
            'headingsOrder',
            'headings',
            'tasks',
          ]
        },
        getter({rootGetters}, listId) {
          const list = this['list/lists'].find(el => el.id === listId)
          let ord = (list.tasks && list.tasks.slice()) || []
          
          let headsOrder = list.headingsOrder.slice()
    
          const heads = rootGetters.checkMissingIdsAndSortArr(headsOrder, list.headings)
          
          for (const h of heads) {
            ord = [...ord, ...h.tasks]
          }
          
          return ord
        },
        cache(args) {
          return args[0]
        },
      },
      pieProgress: {
        touchGetters: [
          'list/getTasks',
        ],
        deepGetterTouch: {
          'list/lists': [
            'calendar',
          ],
          'task/allTasks': [
            'calendar',
            'completed',
            'list',
            'folder',
            'group',
          ]
        },
        getter({}, listId) {
          const list = this['list/lists'].find(el => el.id === listId)
          if (list) {
            const c = list.calendar
            const ts = this['list/getTasks'](listId)
            const numberOfTasks = ts.length
            let completedTasks = 0
            
            let compareDate = null
            if (c && c.lastCompleteDate)
              compareDate = c.lastCompleteDate
      
              ts.forEach(el => {
                if (utilsTask.isTaskCompleted(el, TOD_DATE, compareDate)) completedTasks++
              })
            const result = 100 * completedTasks / numberOfTasks
            if (isNaN(result)) return 0
            return result
          }
          return 0
        },
        cache(args) {
          return args[0]
        },
      },
      getNumberOfListsByView: {
        deepGetterTouch: {
          'list/lists': [
            'calendar',
            'completed',
            'list',
            'folder',
            'deadline',
            'group',
            'tags',
            'assigned',
            'completeDate',
          ]
        },
        getter({getters}, viewName) {
          const ts = this['list/lists'].filter(
            list => getters.isListInView(list, viewName)
          )

          const getDate = () => {
            switch (viewName) {
              case 'Today': return TOD_DATE
              case 'Tomorrow': return TOM_DATE
            }
          }

          return {
            total: ts.length,
            notCompleted: ts.filter(
              list => !getters.isListCompleted(list, getDate()) &&
              !getters.isListCanceled(list)
            ).length,
          }
        },
        cache(args) {
          return args[0]
        },
      },
    }),
    getFavoriteLists(s, getters) {
      return getters.lists.filter(el => el.favorite).map(f => ({...f, icon: 'tasks', color: 'var(--primary)', type: 'list'}))
    },
  },
  actions: {
    // ADD
    addViewList({rootState}, {b, writes, list}) {
      return setList(b, {
        ...list,
        smartViewsOrders: {},
        headings: [],
        headingsOrder: [],
        tasks: [],
        userId: uid(),
        createdFire: new Date(),
        created: mom().format('Y-M-D HH:mm ss'),
      }, list.id, rootState, writes)
    },

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
      const headingsOrder = (list.headingsOrder || []).slice()

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
    addListInGroupByIndexFromView({rootState}, {list, newItemRef, ids, groupId}) {
      const b = fire.batch()

      const writes = []

      setGroup(b, {listsOrder: ids}, groupId, rootState, writes)

      list.group = groupId

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
        logFire: null,
        logDate: null,
        fullLogDate: null,
        completedFire: null,
        completeDate: null,
        completed: false,
        canceled: false,
        checked: false,
        checkDate: null,
        fullCheckDate: null,
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
    async addListInGroupByIndex({rootState}, {ids, item, newItemRef}) {
      const b = fire.batch()

      const writes = []
      item.group = item.folder // this is not wrong
      item.folder = null

      await setGroup(b, {listsOrder: ids}, item.group, rootState, writes)

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
      }, rootState, writes)

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
        if (c && c.type !== 'someday' && c.type !== 'anytime') {
          if (c.type === 'after completion') {
            c.lastCompleteDate = mom().format('Y-M-D')
          }
          else if (c.type === 'weekly' || c.type === 'monthly' || c.type === 'yearly') {
            const nextEventAfterCompletion = utilsMoment.getNextEventAfterCompletionDate(c, true)
            c.lastCompleteDate = nextEventAfterCompletion.format('Y-M-D')
            if (mom(c.lastCompleteDate, 'Y-M-D').isBefore(mom(TOD_DATE, 'Y-M-D'), 'day'))
              c.lastCompleteDate = TOD_DATE
          }

          if (c.ends && c.ends.type === 'times') {
            c.ends.times--
          }
        }

        const tod = mom()
        let obj = {
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

        const isNotRecurringList = !c || (c.type === 'someday' || c.type === 'anytime' || c.type === 'specific')

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
        if (c && c.ends) c.ends = null
        if (c) {
          c.lastCompleteDate = null
        }
        setList(b, {
          logbook: false,
          logFire: null,
          logDate: null,
          fullLogDate: null,
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

      if (!rootState.userInfo.manuallyLogTasks) {
        obj = {
          ...obj,
          logbook: true,
          logFire: new Date(),
          logDate: mom().format('Y-M-D'),
          fullLogDate: mom().format('Y-M-D HH:mm ss'),
        }
      }

      b.commit()
    },
    async uncancelLists({rootState}, ids) {
      const b = fire.batch()

      await batchSetLists(b, {
        canceled: false,
        cancelDate: null,
        checkDate: null,
        logbook: false,
        logFire: null,
        logDate: null,
        fullLogDate: null,
        fullCancelDate: null,
        fullCheckDate: null,
      }, ids, rootState)

      b.commit()
    },
    async addTagsToListsById({rootState}, {ids, tagIds}) {
      const b = fire.batch()

      await batchSetLists(b, {
        tags: fd().arrayUnion(...tagIds),
      }, ids, rootState, undefined, list => {
        Vue.set(list, 'tags', list.tags ? [...list.tags, ...tagIds] : tagIds)
      })

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

      if (list.comp)
        delete list.comp

      setList(b, list, list.id, rootState)

      b.commit()
    },
    saveListsById({rootState}, {list, ids}) {
      if (!ids) return null
      
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
    updateOrder({rootState}, lists) {
      const b = fire.batch()
      
      setInfo(b, {lists}, rootState)

      b.commit()
    },
    updateViewOrder({rootState}, {view, ids}) {
      const obj = {}
      obj[view] = {}
      obj[view].tasks = ids
      const b = fire.batch()
      
      setInfo(b, {
        viewOrders: obj,
      }, rootState)

      b.commit()
    },

    // TASKS
    
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
      }, rootState, writes)

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

      cacheBatchedItems(b, writes, rootState)

      b.commit()
    },

    // HEADING
    
    addHeading({getters, rootState}, {ids, obj, headings, listId, index}) {
      const list = getters.getListsById([listId])[0]
      const b = fire.batch()
      const headindgId = utils.getUid()

      const writes = []

      batchSetTasks(b, {
        heading: headindgId,
      }, ids, rootState, writes)

      const listHeadings = list.headings.slice()
      listHeadings.push({
        name: obj.name,
        color: obj.color,
        notes: obj.notes,
        tasks: ids, id: headindgId
      })
      headings.splice(index, 0, headindgId)

      setList(b, {
        headings: listHeadings,
        headingsOrder: headings,
      }, listId, rootState, writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },
    saveHeading({getters, rootState}, {listId, headingId, heading}) {
      const list = getters.getListsById([listId])[0]
      const b = fire.batch()
      
      const heads = list.headings.slice()
      const i = heads.findIndex(el => el.id === headingId)
      heads[i] = {...heads[i], ...heading}

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
    updateListHeadings({rootState}, {ids, listId}) {
      const b = fire.batch()
      
      setList(b, {headingsOrder: ids}, listId, rootState)

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
      const order = (list.headingsOrder || []).slice()
      const i = order.findIndex(n => n === headingId)
      order.splice(i, 0, newId)

      setList(b, {
        headingsOrder: order,
        headings: heads,
      }, listId, rootState, writes)

      cacheBatchedItems(b, writes)

      b.commit()
    },
    updateHeadingsViewOrder({rootState}, {view, ids}) {
      const obj = {}
      obj[view] = {}
      obj[view].headings = ids
      const b = fire.batch()
      
      setInfo(b, {
        viewOrders: obj,
      }, rootState)

      b.commit()
    },
    updateHeadingsCalendarOrder({rootState}, {date, ids}) {
      const calendarOrders = utilsTask.getUpdatedCalendarOrders(ids, date, rootState, 'headings')
      const b = fire.batch()

      setInfo(b, {calendarOrders}, rootState)

      b.commit()
    },

    deleteList({getters, rootState, rootGetters}, listId) {
      const tasks = rootGetters['task/allTasks']
      const b = fire.batch()
      const list = getters.getListsById([listId])[0]
      let folder = list.folder || null

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
        if (list) {
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
        }
        
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
