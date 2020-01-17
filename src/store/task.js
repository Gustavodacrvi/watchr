
import { fire, auth } from './index'
import fb from 'firebase/app'

import utils from '../utils'
import utilsTask from '../utils/task'
import utilsMoment from '../utils/moment'
import MemoizeGetters from './memoFunctionGetters'
import { uid, fd, userRef, folderRef, serverTimestamp, tagRef, taskColl, taskRef, listRef, addTask } from '../utils/firestore'
import { pipeBooleanFilters } from '@/utils/memo'

import mom from 'moment'

const TODAY_DATE = mom().format('Y-M-D')
const TOM_DATE = mom().add(1, 'day').format('Y-M-D')

export default {
  namespaced: true,
  state: {
    tasks: [],
    updatedTask: false,
  },
  getters: {
    priorityOptions() {
      return [
        {
          name: 'No priority',
          icon: 'priority',
          color: 'var(--gray)',
        },
        {
          name: 'Low priority',
          icon: 'priority',
          color: 'var(--green)',
        },
        {
          name: 'Medium priority',
          icon: 'priority',
          color: 'var(--yellow)',
        },
        {
          name: 'High priority',
          icon: 'priority',
          color: 'var(--red)',
        }
      ]
    },
    getSpecificDayCalendarObj: () => moment => {
      const obj = {
  
        type: 'specific',
        editDate: mom().format('Y-M-D'),
        begins: mom().format('Y-M-D'),
  
        specific: moment.format('Y-M-D'),
      }
      return obj
    },
    ...MemoizeGetters(null, {
      isCalendarObjectShowingToday({}, calendar, date, specific) {
        const c = calendar
        if (!calendar) return false

        if (specific && c.type !== 'specific') return false
        if (c.type === 'someday') return false
        // specific
        if (c.type === 'specific') {
          return date === c.specific
        }

        const tod = mom(date, 'Y-M-D')
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
        
        
        /* if (c.type === 'periodic') {
          const dayDiff = tod.diff(mom(c.editDate, 'Y-M-D'), 'day')
          const eventNotToday = dayDiff % c.periodic !== 0
          if (eventNotToday) return false  
        }
        if (c.type === 'weekly') {
          const todaysWeekDayName = tod.format('ddd').toLowerCase()
          const eventNotToday = !c.weekly.find(w => w.toLowerCase() === todaysWeekDayName)
          if (eventNotToday) return false
        } */
      },
      isTaskCompleted: {
        getter({}, task, moment, compareDate) {
          let isCompleted = utils.isItemCompleted(task, moment)
          if (compareDate) {
            if (!task.completeDate) return false
            const taskCompleteDate = mom(task.completeDate, 'Y-M-D')
            const compare = mom(compareDate, 'Y-M-D')
            return isCompleted && taskCompleteDate.isSameOrAfter(compare, 'day')
          }
          return isCompleted
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
      isTaskOverdue: {
        getter({getters}, task) {
          const calendar = task.calendar
          if (!calendar || getters.isTaskCompleted(task)) return false
          
          let tod = null
          const getTod = () => {
            if (tod) return tod
            tod = mom()
            return tod
          }
  
          const c = calendar
          if (c.type === 'specific') {
            const spec = mom(c.specific, 'Y-M-D')
            return spec.isBefore(getTod(), 'day')
          }
          if (c.type === 'after completion') return false
          if (c.type === 'daily' || c.type === 'weekly' || c.type === 'monthly' || c.type === 'yearly') {
            const nextEvent = utilsMoment.getNextEventAfterCompletionDate(c)
            return nextEvent.isBefore(getTod(), 'day')
          }
/*           if (c.type === 'periodic') {
            return utilsMoment.getNextEventAfterCompletionDate(c).isBefore(getTod(), 'day')
          }
          if (c.type === 'weekly') {
            const lastWeeklyEvent = utilsMoment.getLastWeeklyEvent(c, getTod())
            const lastComplete = mom(c.lastCompleteDate, 'Y-M-D')
            return lastWeeklyEvent.isAfter(lastComplete, 'day')
          } */
  
          return false
        },
        cache(args) {
          const t = args[0]
          return JSON.stringify({
            c: t.calendar, co: t.completed,
          })
        },
      },
      isTaskInPeriod: {
        getter({}, task, initial, period, onlySpecific) {
          const c = task.calendar
          if (!calendar) return false
          if (onlySpecific && c.type !== 'specific') return false
          if (c.type === 'someday') return false
          // specific
          const first = utilsMoment.getFirstDayOfMonth(mom(initial, 'Y-M-D'))
          const last = utilsMoment.getFirstLastDayOfMonth(mom(initial, 'Y-M-D'))
      
          if (c.type === 'specific') {
            const spec = mom(c.specific, 'Y-M-D')
            return spec.isSameOrAfter(first, period) && spec.isSameOrBefore(last, period)
          }
          return false
        },
        cache(args) {
          return JSON.stringify({
            calendar: args[0].calendar,
            i: args[1], p: args[2], s: args[3],
          })
        },
      },
      isTaskShowingOnDate: {
        getter({getters}, task, date, onlySpecific) {
          if (!utilsTask.hasCalendarBinding(task) || task.calendar.type === 'someday')
            return false
          if (onlySpecific && task.calendar.type !== 'specific') return false
          return getters.isCalendarObjectShowingToday(task.calendar, date, onlySpecific)
        },
        cache(args) {
          return JSON.stringify({
            task: args[0].calendar,
            date: args[1],
            onlySpecific: args[2],
          })
        }
      },
      isTaskWeekly: {
        getter({}, task) {
          return task.calendar && task.calendar.type === 'weekly'
        },
        cache(args) {
          return JSON.stringify({
            t: args[0].calendar
          })
        },
      },
      doesTaskPassInclusivePriority: {
        getter({}, task, inclusive) {
          if (inclusive === 'No priority')
            return !task.priority
          return inclusive === task.priority
        },
        cache(args) {
          return JSON.stringify({
            t: args[0].priority,
            p: args[1],
          })
        }
      },
      doesTaskPassExclusivePriorities: {
        getter({}, task, exclusive) {
          return exclusive.every(p => {
            if (p === 'No priority')
              return task.priority
            return task.priority !== p
          })
        },
        cache(args) {
          return JSON.stringify({
            t: args[0].priority,
            p: args[1],
          })
        }
      },
      hasTaskBeenCompletedOnDate: {
        getter({}, task, date) {
          return task.completeDate === date
        },
        cache(args) {
          return JSON.stringify({t: args[0].completeDate, date: args[1]})
        }
      },
      isTaskInCompletedView: {
        getter({getters}, task) {
          return getters.isTaskCompleted(task)
        },
        cache(args) {
          return JSON.stringify({
            t: args[0].calendar,
            c: args[0].completed,
          })
        },
      },
      isTaskInView: {
        getter({getters}, task, view) {
          switch (view) {
            case 'Inbox': return getters.isTaskInbox(task)
            case 'Today': return getters.isTaskShowingOnDate(task, TODAY_DATE)
            case 'Someday': return getters.isTaskSomeday(task)
            case 'Overdue': return getters.isTaskOverdue(task)
            case 'Anytime': return getters.isTaskAnytime(task)
            case 'Tomorrow': return getters.isTaskShowingOnDate(task, TOM_DATE)
            case 'Completed': return getters.isTaskInCompletedView(task)
          }
        },
        cache(args) {
          const view = args[1]
          const t = args[0]
          let obj = {}

          switch (view) {
            case 'Inbox': {
              obj = {
                completed: t.completed,
                calendar: t.calendar,
                list: t.list,
                folder: t.folder,
                tags: t.tags,
              }
              break
            }
            case 'Anytime': {
              obj = {
                calendar: t.calendar,
                list: t.list,
                folder: t.folder,
                tags: t.tags,
              }
              break
            }
            case 'Today': {
              obj = {
                calendar: t.calendar,
                today: TODAY_DATE,
                complete: t.completeDate
              }
              break
            }
            case 'Someday': {
              obj = t.calendar
              break
            }
            case 'Overdue': {
              obj = {
                c: t.calendar,
                t: t.completed,
              }
              break
            }
            case 'Tomorrow': {
              obj = {
                calendar: t.calendar,
                today: TOM_DATE,
                complete: t.completeDate
              }
              break
            }
            case 'Completed': {
              obj = {
                cal: t.calendar,
                complete: t.completeDate
              }
              break
            }
          }

          return JSON.stringify({obj, view})
        },
      },
      isTaskInOneYear: {
        getter({}, task) {
          if (!task.calendar) return false
          return mom().add(1, 'y').startOf('year').isBefore(mom(task.calendar.specific, 'Y-M-D'), 'day')
        },
        cache(args) {
          return JSON.stringify(args[0].calendar)
        },
      },
      isTaskInSevenDays: {
        getter({}, task) {
          if (!task.calendar) return false
          return mom().add(7, 'd').isBefore(mom(task.calendar.specific, 'Y-M-D'), 'day')
        },
        cache(args) {
          return JSON.stringify(args[0].calendar)
        },
      },
      isTaskInOneMonth: {
        getter({}, task) {
          if (!task.calendar) return false
          return mom().add(1, 'M').startOf('month').isBefore(mom(task.calendar.specific, 'Y-M-D'), 'day')
        },
        cache(args) {
          return JSON.stringify(args[0].calendar)
        },
      },
      isTaskInbox: {
        getter({}, task) {
          return !task.completed &&
          !utilsTask.hasCalendarBinding(task) &&
          !task.list &&
          !task.folder &&
          task.tags.length === 0
        },
        cache(args) {
          const t = args[0]
          return JSON.stringify({
            completed: t.completed,
            calendar: t.calendar,
            list: t.list,
            folder: t.folder,
            tags: t.tags,
          })
        },
      },
      isTaskAnytime: {
        getter({}, task) {
          const hasListOrFolderOrTag = task.list || task.folder || (task.tags && task.tags.length > 0)
          return hasListOrFolderOrTag &&
            !utilsTask.hasCalendarBinding(task)
        },
        cache(args) {
          const t = args[0]
          return JSON.stringify({
            l: t.list, f: t.folder, t: t.tags,
            c: t.calendar,
          })
        },
      },
      isTaskSomeday: {
        getter({}, task) {
          return task.calendar && task.calendar.type === 'someday'
        },
        cache(args) {
          if (args[0].calendar)
            return JSON.stringify({
              t: args[0].calendar.type
            })
          return ''
        }
      },
      doesTaskPassExclusiveFolders: {
        getter({}, task, ids) {
          return ids.every(el => task.folder !== el)
        },
        cache(args) {
          return JSON.stringify({t: args[0].folder, l: args[1]})
        }
      },
      doesTaskIncludeText: {
        getter({}, task, name) {
          return task.name.includes(name)
        },
        cache(args) {
          return JSON.stringify({t: args[0].name, n: args[1]})
        }
      },
      doesTaskPassInclusiveFolder: {
        getter({}, task, folderId) {
          return task.folder === folderId
        },
        cache(args) {
          return JSON.stringify({t: args[0].folder, l: args[1]})
        }
      },
      doesTaskPassExclusiveLists: {
        getter({}, task, ids) {
          return ids.every(el => task.list !== el)
        },
        cache(args) {
          return JSON.stringify({t: args[0].list, l: args[1]})
        }
      },
      doesTaskPassInclusiveList: {
        getter({}, task, listId) {
          return task.list === listId
        },
        cache(args) {
          return JSON.stringify({t: args[0].list, l: args[1]})
        }
      },
      doesTaskPassExclusiveTags: {
        getter({}, task, tags, savedTags) {

          const foundChild = parent => {

            const childs = savedTags.filter(tag => tag.parent === parent)
            for (const tag of childs)
              if (task.tags.includes(tag.id) || foundChild(tag.id))
                return true
            return false
          }

          for (const id of tags) {
            if (task.tags.includes(id) || foundChild(id)) return false
          }

          return true
        },
        cache(args) {
          return JSON.stringify({
            k: args[0].tags, t: args[1],
            s: args[2].map(el => ({i: el.id, p: el.parent})),
          })
        }
      },
      doesTaskPassInclusiveTags: {
        getter({}, task, tags, savedTags) {
          const foundChild = parent => {

            const childs = savedTags.filter(tag => tag.parent === parent)
            for (const tag of childs)
              if (task.tags.includes(tag.id) || foundChild(tag.id))
                return true
            return false
          }

          for (const id of tags)
            if (!task.tags.includes(id) && !foundChild(id)) return false

          return true
        },
        cache(args) {
          return JSON.stringify({
            k: args[0].tags, t: args[1],
            s: args[2].map(el => ({i: el.id, p: el.parent})),
          })
        }
      },
      isTaskInFolder: {
        getter({}, task, folderId) {
          return task.folder === folderId
        },
        cache(args) {
          return JSON.stringify({
            t: args[0].folder,
            l: args[1],
          })
        }
      },
      isTaskInList: {
        getter({}, task, listId) {
          return task.list === listId
        },
        cache(args) {
          return JSON.stringify({
            t: args[0].list,
            l: args[1],
          })
        }
      },
      isTaskInHeading: {
        getter({}, task, heading) {
          return task.heading === heading.id
        },
        cache(args) {
          return JSON.stringify({
            t: args[0].heading,
            h: args[1].name,
          })
        },
      },
      isTaskInListRoot: {
        getter({}, task) {
          return task.list && !task.heading
        },
        cache(args) {
          return JSON.stringify({
            l: args[0].list,
            h: args[0].heading,
          })
        },
      },
    }),
    ...MemoizeGetters('tasks', {
      getNumberOfTasksByTag: {
        react: [
          'tags',
        ],
        getter({getters, state}, {tagId, tags}) {
          const ts = state.tasks.filter(
            task => getters.doesTaskPassInclusiveTags(task, [tagId], tags)
          )
    
          return {
            total: ts.length,
            notCompleted: ts.filter(
              task => !getters.isTaskCompleted(task)
            ).length,
          }
        },
      },
      getOverdueTasks: {
        react: [
          'calendar',
          'completed',
        ],
        getter({getters, state}) {
          return state.tasks.filter(getters.isTaskOverdue)
        },
      },
      getTasksById({state}, ids) {
        const arr = []
        for (const id of ids) {
          const task = state.tasks.find(el => el.id === id)
          if (task) arr.push(task)
        }
        return arr
      },
      getNumberOfTasksByView: {
        react: [
          'calendar',
          'completed',
          'list',
          'folder',
          'tags',
          'completeDate',
        ],
        getter({state, getters}, viewName) {
          const ts = state.tasks.filter(
            task => getters.isTaskInView(task, viewName)
          )
  
          return {
            total: ts.length,
            notCompleted: ts.filter(
              task => !getters.isTaskCompleted(task)
            ).length,
          }
        },
      },
    }),
  },
  actions: {
    getData({state}) {
      const id = uid()
      if (id)
        return Promise.all([
          new Promise(resolve => {
            taskColl().where('userId', '==', id).onSnapshot(snap => {
              utils.getDataFromFirestoreSnapshot(state, snap.docChanges(), 'tasks')
              resolve()
            })
          })
        ])
    },
    addTask({}, obj) {
      const batch = fire.batch()

      const ref = taskRef()
      addTask(batch, {
        userId: uid(),
        createdFire: serverTimestamp(),
        created: mom().format('Y-M-D HH:mm ss'),
        ...obj,
      }, ref).then(() => {
        batch.commit()
      })
    },
    addMultipleTasks(c, tasks) {
      const batch = fire.batch()

      for (const t of tasks)
        batch.set(taskRef(), {
          createdFire: serverTimestamp(),
          created: mom().format('Y-M-D HH:mm ss'),
          userId: uid(),
          ...t,
        })

      batch.commit()
    },
    saveTask(c, obj) {
      const batch = fire.batch()
      addTask(batch, obj, taskRef(obj.id)).then(() => {
        batch.commit()
      })
    },
    deleteTasks(c, ids) {
      const batch = fire.batch()

      for (const id of ids) {
        const ref = taskRef(id)
        batch.delete(ref)
      }

      batch.commit()
    },
    saveSchedule(c, {date, schedule}) {
      userRef().set({
        calendarOrders: {
          [date]: {schedule},
        }
      }, {merge: true})
    },
    saveCalendarOrder({rootState}, {ids, date}) {
      const calendarOrders = utilsTask.getUpdatedCalendarOrders(ids, date, rootState)
      userRef().set({calendarOrders}, {merge: true})
    },
    convertTasksToListByIndex(c, {tasks, folderId, order, savedLists, indicies}) {
      const tasksWithConflictingListNames = {}

      tasks.forEach(task => {
        if (savedLists.find(l => l.name === task.name))
          tasksWithConflictingListNames[task.id] = true
      })
      
      const batch = fire.batch()

      tasks.forEach(task => {

        const list = listRef(task.id)
        batch.delete(taskRef(task.id))

        const subIds = []
        if (task.checklist)
          for (const t of task.checklist) {
            batch.set(taskRef(t.id), {
              folder: null,
              userId: uid(),
              name: t.name,
              priority: '',
              list: list.id,
              calendar: null,
              heading: null,
              tags: [],
              checklist: [],
              order: [],
            })
            subIds.push(t.id)
          }

        batch.set(list, {
          userId: uid(),
          smartViewsOrders: {},
          folder: folderId,
          name: tasksWithConflictingListNames[task.id] ? task.name + ' (list)' : task.name,
          notes: task.notes || null,
          tags: task.tags || [],
          descr: '',
          tasks: subIds,
          headings: [],
          headingsOrder: [],
        })
        
      })

      batch.set(folderRef(folderId), {
        order,
      }, {merge: true})
      
      batch.commit()
    },
    convertToList(c, {task, savedLists}) {
      const existingList = savedLists.find(l => l.name === task.name)
      if (!existingList) {
        const batch = fire.batch()
  
        let folder = null
        if (task.list) {
          const list = savedLists.find(l => l.id === task.list)
          if (list && list.folder) folder = list.folder
        }
  
        const list = listRef()
        batch.delete(taskRef(task.id))
        
        const ids = []
        if (task.checklist)
          for (const t of task.checklist) {
            const ref = taskRef(t.id)
            batch.set(ref, {
              folder,
              userId: uid(),
              name: t.name,
              priority: '',
              list: list.id,
              calendar: null,
              heading: null,
              tags: [],
              checklist: [],
              order: [],
            })
            ids.push(t.id)
          }
  
        batch.set(list, {
          userId: uid(),
          users: [uid()],
          smartViewsOrders: {},
          name: task.name,
          notes: task.notes || null,
          tags: task.tags || [],
          descr: '',
          tasks: ids,
          headings: [],
          headingsOrder: [],
        })
  
        batch.commit()
      }
    },
    completeTasks(c, tasks) {
      const batch = fire.batch()

      for (const t of tasks) {
        let calendar = c = t.calendar
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

        const ref = taskRef(t.id)
        batch.update(ref, {
          completedFire: serverTimestamp(),
          completeDate: mom().format('Y-M-D'),
          fullCompleteDate: mom().format('Y-M-D HH:mm ss'),
          completed: true,
          calendar,
        })

      }
      
      batch.commit()
    },
    uncompleteTasks(c, tasks) {
      const batch = fire.batch()

      for (const t of tasks) {
        const c = t.calendar
        if (c && c.times === 0) c.times = null
        const ref = taskRef(t.id)
        batch.update(ref, {
          completedFire: null,
          completeDate: null,
          completed: false,
          calendar: c,
        })
      }

      batch.commit()
    },
    saveTasksById(c, {ids, task}) {
      const batch = fire.batch()

      for (const id of ids) {
        batch.update(taskRef(id), {
          ...task,
        })
      }

      batch.commit()
    },
    addTagsToTasksById(c, {ids, tagIds}) {
      const batch = fire.batch()

      for (const id of ids) {
        const ref = taskRef(id)
        batch.update(ref, {
          tags: fd().arrayUnion(...tagIds),
        })
      }

      batch.commit()
    },
    addListToTasksById(c, {ids, listId}) {
      const batch = fire.batch()

      for (const id of ids) {
        batch.update(taskRef(id), {
          list: listId,
          folder: null,
          heading: null,
        })
      }

      batch.commit()
    },
    addFolderToTasksById(c, {ids, folderId}) {
      const batch = fire.batch()

      for (const id of ids)
        batch.update(taskRef(id), {
          list: null,
          folder: folderId,
          heading: null,
        })
      
      batch.commit()
    },
    copyTask(c, task) {
      userRef().collection('tasks').add({
        ...task, files: [],
      })
    },
    handleTasksByAppnavElementDragAndDrop({dispatch, getters, rootState}, {elIds, taskIds, type}) {
      const calObj = (mom) => {
        return getters.getSpecificDayCalendarObj(mom)
      }
      switch (type) {
        case 'tag': {
          dispatch('addTagsToTasksById', {
            tagIds: elIds.slice(),
            ids: taskIds,
          })
          break
        }
        case 'list': {
          dispatch('addListToTasksById', {
            listId: elIds[0],
            ids: taskIds,
          })
          break
        }
        case 'folder': {
          dispatch('addFolderToTasksById', {
            folderId: elIds[0],
            ids: taskIds,
          })
          break
        }
        case 'Today': {
          dispatch('saveTasksById', {
            ids: taskIds,
            task: {
              calendar: calObj(mom()),
            }
          })
          break
        }
        case 'Tomorrow': {
          dispatch('saveTasksById', {
            ids: taskIds,
            task: {
              calendar: calObj(mom().add(1, 'day')),
            }
          })
          break
        }
        case 'Someday': {
          dispatch('saveTasksById', {
            ids: taskIds,
            task: {
              calendar: {type: 'someday'}
            }
          })
          break
        }
        case 'Completed': {
          dispatch('completeTasks', getters.getTasksById(taskIds))
          break
        }
      }
    },
    deleteAllData({state}) {
      for (const el of state.tasks)
        taskRef(el.id).delete()
    },
  },
}
