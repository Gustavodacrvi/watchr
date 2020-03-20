
import { fire, auth } from './index'
import fb from 'firebase/app'

import Vue from 'vue'

import utils from '../utils'
import timeline from '../utils/timeline'
import utilsTask from '../utils/task'
import utilsMoment from '../utils/moment'
import MemoizeGetters from './memoFunctionGetters'
import { uid, fd, setInfo, folderRef, taskRef, listRef, setTask, deleteTask, cacheBatchedItems, batchSetTasks, batchDeleteTasks, setFolder, setList, setGroup } from '../utils/firestore'

import mom, { duration } from 'moment'

const TODAY_MOM = mom()

const TODAY_DATE = TODAY_MOM.format('Y-M-D')
const TOM_DATE = TODAY_MOM.clone().add(1, 'day').format('Y-M-D')

export default {
  namespaced: true,
  state: {
    tasks: {},
    groupTasks: {},
  },
  getters: {
    allTasks(state) {
      const keys = Object.keys(state.tasks).filter(
        k => state.tasks[k]
      )
      const groupKeys = Object.keys(state.groupTasks).filter(
        k => state.groupTasks[k]
      )
      
      return keys.map(k => state.tasks[k]).concat(groupKeys.map(k => state.groupTasks[k]))
    },
    logTasks(state, getters) {
      const keys = Object.keys(state.tasks).filter(
        k => state.tasks[k] && getters.isTaskInLogbook(state.tasks[k])
      )
      const groupKeys = Object.keys(state.groupTasks).filter(
        k => state.groupTasks[k] && getters.isTaskInLogbook(state.groupTasks[k])
      )
      
      return Object.freeze(
        keys.map(k => state.tasks[k]).concat(groupKeys.map(k => state.groupTasks[k]))
      )
    },
    tasks(state, getters) {
      const keys = Object.keys(state.tasks).filter(
        k => state.tasks[k] && !getters.isTaskInLogbook(state.tasks[k])
      )
      const groupKeys = Object.keys(state.groupTasks).filter(
        k => state.groupTasks[k] && !getters.isTaskInLogbook(state.groupTasks[k])
      )

      return keys.map(k => state.tasks[k]).concat(groupKeys.map(k => state.groupTasks[k]))
    },
    priorityOptions() {
      return [
        {
          name: 'No priority',
          icon: 'priority',
          color: 'var(--fade)',
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
  
        specific: (moment.format) ? moment.format('Y-M-D') : moment,
      }
      return obj
    },

    isTaskCanceled: () => t => t.canceled,
    isTaskWeekly: () => t => t.calendar && t.calendar.type === 'weekly',
    hasTaskBeenCompletedOnDate: () => (t, date) => t.completeDate === date || t.checkDate === date,
    isTaskInLogbookView: (s, getters) => t => getters.isTaskInLogbook(t),
    isTaskSomeday: () => t => t.calendar && t.calendar.type === 'someday',
    isTaskAnytime: () => t => t.calendar && t.calendar.type === 'anytime',
    isTaskInFolder: () => (t, folderId) => t.folder === folderId,
    isTaskInGroup: () => (t, groupId) => t.group === groupId && !t.list,
    isTaskInList: () => (t, listId) => t.list === listId,
    isTaskInHeading: () => (t, heading) => t.heading === heading.id,
    isTaskInListRoot: () => t => t.list && !t.heading,
    isTaskInbox: () => t => !t.calendar,
    isRecurringTask: () => t => t.calendar && t.calendar.type !== 'someday' && t.calendar.type !== 'specific' && t.calendar.type !== 'anytime',
    hasDurationAndTime: () => t => t.calendar && t.calendar.time && t.taskDuration,
    
    ...MemoizeGetters({
      isCalendarObjectShowingToday: {
        deepStateTouch: {
          'userInfo/allowOverdue': [],
        },
        getter({rootState}, calendar, date, specific = false, exact = false) {
          if (!calendar) return false
          const c = calendar
          const allowOverdue = rootState.userInfo.allowOverdue
  
          if (specific && c.type !== 'specific') return false
          if (c.type === 'someday' || c.type === 'anytime') return false
          // specific
          const tod = mom(date, 'Y-M-D')
          if (c.type === 'specific') {
            if (exact || allowOverdue || specific)
              return date === c.specific
            return tod.isSameOrAfter(mom(c.specific, 'Y-M-D'), 'day')
          }
  
          const begins = mom(c.begins, 'Y-M-D')
  
          if (c.ends) {
            if (c.ends.type === 'on date' && tod.isAfter(mom(c.ends.onDate, 'Y-M-D'), 'day'))
              return false
            else if (c.ends.times === 0)
              return false
          }
          if (c.begins && !tod.isSameOrAfter(begins, 'day'))
            return false
          
          if (c.type === 'after completion') {
            const lastComplete = c.lastCompleteDate ? mom(c.lastCompleteDate, 'Y-M-D') : begins
            if (!c.lastCompleteDate && begins.isSame(tod, 'day')) return true
            
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
          return args[0] ? JSON.stringify({
            c: args[0],
            d: args[1],
            s: args[2],
            ds: args[3],
          }) : ''
        },
      },
      isTaskInLogbook: {
        getter({}, task) {
          return utilsTask.isTaskInLogbook(task)
        },
        cache(args) {
          return args[0].calendar ?
            JSON.stringify({
              c: args[0].calendar,
              l: args[0].logbook
            }) :
            args[0].logbook
        },
      },
      isTaskCompleted: {
        getter({}, task, moment, compareDate) {
          return utilsTask.isTaskCompleted(task, moment, compareDate)
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
        deepStateTouch: {
          'userInfo/allowOverdue': [],
        },
        getter({getters, rootState}, task, date) {
          const calendar = task.calendar

          let tod = null
          const getTod = () => {
            if (tod) return tod
            tod = mom(date || TODAY_DATE, 'Y-M-D')
            return tod
          }
        
          if (task.deadline && !task.checked && mom(task.deadline, 'Y-M-D').isBefore(getTod(), 'day')) return true
          
          if (!calendar || getters.isTaskInView(task, "Logbook")) return false
          
          const c = calendar
          if (c.type === 'specific') {
            if (!rootState.userInfo.allowOverdue)
              return false
            const spec = mom(c.specific, 'Y-M-D')
            return spec.isBefore(getTod(), 'day')
          }
          if (c.type === 'after completion') return false
          if (c.type === 'daily' || c.type === 'weekly' || c.type === 'monthly' || c.type === 'yearly') {
            const nextEvent = utilsMoment.getNextEventAfterCompletionDate(c)
            return nextEvent.isBefore(getTod(), 'day')
          }
  
          return false
        },
        cache(args) {
          const t = args[0]
          return JSON.stringify({
            c: t.calendar, co: t.completed,
            ce: t.checked,
            d: t.deadline,
          })
        },
      },
      isTaskInPeriod: {
        getter({}, task, initial, period, onlySpecific) {
          if (!task.calendar) return false
          const c = task.calendar
          if (onlySpecific && c.type !== 'specific') return false
          if (c.type === 'someday' || c.type === 'anytime') return false
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
          return args[0].calendar ? JSON.stringify({
            calendar: args[0].calendar,
            i: args[1], p: args[2], s: args[3],
          }) : ''
        },
      },
      isTaskShowingOnDate: {
        getter({getters}, task, date, onlySpecific = false, exact = false) {
          if (task.deadline && mom(task.deadline, 'Y-M-D').isBefore(mom(TOM_DATE, 'Y-M-D'), 'day'))
            return false

          if (!utilsTask.hasCalendarBinding(task) || task.calendar.type === 'someday' || task.calendar.type === 'anytime')
            return false
          if (onlySpecific && task.calendar.type !== 'specific') return false

          return getters.isCalendarObjectShowingToday(task.calendar, date, onlySpecific, exact)
        },
        cache(args) {
          return JSON.stringify({
            task: args[0].calendar,
            deadline: args[0].deadline,
            date: args[1],
            onlySpecific: args[2],
            ic: args[3],
          })
        }
      },
      wasTaskLoggedLastWeek: {
        getter({getters}, task) {
          if (!getters.isTaskInLogbook(task) || !task.logDate)
            return false
          return mom(task.logDate, 'Y-M-D').isSame(
            mom(TODAY_DATE, 'Y-M-D').subtract(1, 'week')
          , 'week')
        },
        cache(args) {
          return JSON.stringify({
            l: args[0].logDate,
            t: args[0].logbook
          })
        }
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
      getTaskDeadlineStr: {
        getter({}, task, date, l) {
          const getDaysLeft = (deadline, date) => {
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
          }
          
          if (!task.deadline)
            return null
          const readable = utils.getHumanReadableDate(task.deadline)
          return (readable === 'Today' ? '' : readable) + ' ' + getDaysLeft(task.deadline, date)
        },
        cache(args) {
          return args[0].deadline
        },
      },
      isTaskInView: {
        getter({getters, rootState}, task, view) {
          switch (view) {
            case 'Inbox': return getters.isTaskInbox(task)
            case 'Today': return getters.isTaskShowingOnDate(task, TODAY_DATE)
            case 'Someday': return getters.isTaskSomeday(task)
            case 'Overdue': return getters.isTaskOverdue(task)
            case 'Deadlines': return task.deadline
            case 'Recurring': return getters.isRecurringTask(task)
            case 'Anytime': return getters.isTaskAnytime(task)
            case 'Tomorrow': return getters.isTaskShowingOnDate(task, TOM_DATE, false, true)
            case 'Logbook': return getters.isTaskInLogbookView(task)
            case 'Assigned to me': return task.assigned === rootState.user.uid
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
                d: t.deadline,
                group: t.group,
                folder: t.folder,
                tags: t.tags,
              }
              break
            }
            case 'Anytime': {
              obj = {
                calendar: t.calendar,
                list: t.list,
                group: t.group,
                folder: t.folder,
                tags: t.tags,
              }
              break
            }
            case 'Today': {
              obj = {
                calendar: t.calendar,
                deadline: t.deadline,
                today: TODAY_DATE,
                complete: t.completeDate,
                checkCom: t.checkDate,
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
                e: t.checked,
                d: t.deadline,
              }
              break
            }
            case 'Tomorrow': {
              obj = {
                calendar: t.calendar,
                deadline: t.deadline,
                today: TOM_DATE,
                complete: t.completeDate,
                checkCom: t.checkDate,
              }
              break
            }
            case 'Logbook': {
              obj = {
                cal: t.calendar,
                deadline: t.deadline,
                complete: t.completeDate,
                ca: t.canceled,
              }
              break
            }
            case 'Deadlines': {
              obj = {
                d: t.deadline,
                c: t.completed,
                ca: t.canceled,
              }
              break
            }
            case 'Recurring': {
              obj = {
                cal: t.calendar,
                c: t.completed,
                ca: t.canceled,
              }
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
      isTaskInOneYear: {
        getter({}, task) {
          if (!task.calendar || task.calendar.type !== 'specific') return false
          return mom().add(1, 'y').startOf('year').isBefore(mom(task.calendar.specific, 'Y-M-D'), 'day')
        },
        cache(args) {
          return JSON.stringify(args[0].calendar)
        },
      },
      isTaskDeadlineInOneYear: {
        getter({}, task) {
          if (!task.deadline)
            return false
          return mom().add(1, 'y').startOf('year').isBefore(mom(task.deadline, 'Y-M-D'), 'day')
        },
        cache(args) {
          return args[0].deadline
        },
      },
      isOldTask: {
        getter({}, task) {
          if (!task.logDate)
            return false
          return mom(task.logDate, 'Y-M-D').isBefore(TODAY_MOM, 'year')
        },
        cache(args) {
          return args[0].logDate
        },
      },
      wasTaskLoggedInMonth: {
        getter({}, task, monthNum) {
          return mom(task.logDate, 'Y-M-D').isSame(mom().month(monthNum), 'month')
        },
        cache(args) {
          return ('' + args[0].logDate) + args[1]
        },
      },
      isTaskInMonth: {
        getter({}, task, monthNum) {
          if (!task.calendar || task.calendar.type !== 'specific') return false
          return mom(task.calendar.specific, 'Y-M-D').isSame(mom().month(monthNum), 'month')
        },
        cache(args) {
          return JSON.stringify([args[0].calendar, args[1]])
        },
      },
      isTaskDeadlineThisMonth: {
        getter({}, task) {
          if (!task.deadline)
            return false
          return mom(task.deadline, 'Y-M-D').isSame(mom(), 'month')
        },
        cache(args) {
          return args[0].deadline
        },
      },
      isTaskDeadlineInMonth: {
        getter({}, task, month) {
          if (!task.deadline)
            return false
          return mom(task.deadline, 'Y-M-D').isSame(mom().month(month), 'month')
        },
        cache(args) {
          return JSON.stringify([args[0].deadline, args[1]])
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
      doesTaskPassExclusiveFolders: {
        getter({}, task, ids) {
          return ids.every(el => task.folder !== el)
        },
        cache(args) {
          return JSON.stringify({t: args[0].folder, l: args[1]})
        }
      },
      doesTaskPassExclusiveGroups: {
        getter({}, task, ids) {
          return ids.every(el => task.group !== el)
        },
        cache(args) {
          return JSON.stringify({t: args[0].group, l: args[1]})
        }
      },
      doesTaskIncludeText: {
        getter({}, task, name) {
          return task.name && task.name.includes(name)
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
      doesTaskPassInclusiveGroup: {
        getter({}, task, groupId) {
          return task.group === groupId
        },
        cache(args) {
          return JSON.stringify({t: args[0].group, l: args[1]})
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
        touchGetters: [
          'tag/tags',
        ],
        getter({}, task, tags) {

          const foundChild = parent => {

            const childs = this['tag/tags'].filter(tag => tag.parent === parent)
            for (const tag of childs)
              if ((task.tags && task.tags.includes(tag.id)) || foundChild(tag.id))
                return true
            return false
          }

          for (const id of tags) {
            if ((task.tags && task.tags.includes(id)) || foundChild(id)) return false
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
        touchGetters: [
          'tag/tags',
        ],
        getter({}, task, tags) {
          const foundChild = parent => {

            const childs = this['tag/tags'].filter(tag => tag.parent === parent)
            for (const tag of childs)
              if ((task.tags && task.tags.includes(tag.id)) || foundChild(tag.id))
                return true
            return false
          }

          for (const id of tags)
            if ((!task.tags || !task.tags.includes(id)) && !foundChild(id)) return false

          return true
        },
        cache(args) {
          return JSON.stringify({
            k: args[0].tags, t: args[1],
          })
        }
      },
      isTaskLastDeadlineDay: {
        getter({}, task, date) {
          if (!task.deadline || task.completed || task.canceled)
            return false
          return task.deadline === (date || TODAY_DATE)
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


      getEndsTodayTasks: {
        deepGetterTouch: {
          'task/tasks': [
            'completed',
            'deadline',
            'canceled',
          ],
        },
        getter({getters}, date) {
          return this['task/tasks'].filter(t => getters.isTaskLastDeadlineDay(t, date)) 
        },
        cache(args) {
          return args[0]
        },
      },
      getTaskStartAndEnd: {
        getter({}, task) {
          const split = task.taskDuration.split(':') // HH:mm
          const start = task.calendar.time // HH:mm
  
          return {
            start,
            id: task.id,
            end: mom(start, 'HH:mm')
              .add(parseInt(split[0], 10), 'hour')
              .add(parseInt(split[1], 10), 'minute')
              .format('HH:mm'),
          }
        },
        cache(args) {
          const t = args[0]
          return JSON.stringify({
            time: t.taskDuration,
            id: t.id,
            start: t.calendar.time,
          })
        },
      },
      getNumberOfTasksByTag: {
        deepGetterTouch: {
          'task/tasks': [
            'tags',
          ],
        },
        getter({getters}, tagId) {
          const ts = this['task/tasks'].filter(
            task => getters.doesTaskPassInclusiveTags(task, [tagId])
          )
    
          return {
            total: ts.length,
            notCompleted: ts.filter(
              task => !getters.isTaskInView(task, "Logbook")
            ).length,
          }
        },
        cache(args) {
          return args[0]
        },
      },
      getOverdueTasks: {
        deepGetterTouch: {
          'task/tasks': [
            'calendar',
            'completed',
            'checked',
            'deadline',
          ]
        },
        getter({getters}) {
          return this['task/tasks'].filter(t => getters.isTaskOverdue(t))
        },
      },
      getAssignedTasksByList: {
        deepGetterTouch: {
          'task/tasks': [
            'canceled',
            'calendar',
            'completed',
            'group',
            'list',
            'assigned',
          ],
        },
        getter({getters}, groupId, list, date) {
          const userId = uid()
          return this['task/tasks'].filter(t => 
              !getters.isTaskCompleted(t) &&
              !getters.isTaskCanceled(t) &&
              t.assigned === userId &&
              t.group === groupId &&
              t.list === list
            ).length
        },
      },
      numberOfAssignedToMeTasks: {
        deepGetterTouch: {
          'task/tasks': [
            'canceled',
            'calendar',
            'group',
            'list',
            'completed',
            'assigned',
          ],
        },
        getter({getters}, groupId) {
          const userId = uid()
          return this['task/tasks'].filter(t =>
            !getters.isTaskCompleted(t) &&
            !getters.isTaskCanceled(t) &&
            t.assigned === userId &&
            t.group === groupId
          ).length
        },
      },
      getTasksById: {
        touchGetters: [
          'task/allTasks',
        ],
        getter({}, ids) {
          const arr = []
          for (const id of ids) {
            const task = this['task/allTasks'].find(el => el.id === id)
            if (task) arr.push(task)
          }
          return arr
        },
      },
      getNumberOfTasksByView: {
        deepGetterTouch: {
          'task/tasks': [
            'calendar',
            'completed',
            'logbook',
            'list',
            'folder',
            'deadline',
            'group',
            'tags',
            'assigned',
            'completeDate',
          ],
        },
        getter({getters}, viewName) {
          const ts = this['task/tasks'].filter(
            task => getters.isTaskInView(task, viewName)
          )

          const getDate = () => {
            switch (viewName) {
              case 'Today': return TODAY_DATE
              case 'Tomorrow': return TOM_DATE
            }
          }

          return {
            total: ts.length,
            notCompleted: ts.filter(
              task => !getters.isTaskCompleted(task, getDate()) &&
              !getters.isTaskCanceled(task)
            ).length,
          }
        },
        cache(args) {
          return args[0]
        },
      },
    }),
  },
  actions: {
    addViewTask({rootState}, {b, writes, task}) {
      return setTask(b, {
        ...task,
        userId: uid(),
        createdFire: new Date(),
        created: mom().format('Y-M-D HH:mm ss'),
      }, rootState, task.id, writes)
    },
    addTasksFromGmailThreads({rootState, dispatch,}, threads) {
      const writes = []
      const b = fire.batch()

      threads.forEach(({result}) => {
        const r = result
        const m = r.messages[r.messages.length - 1]

        const getHeaderValue = name => (m.payload.headers.find(el => el.name === name) || {value: ''}).value

        dispatch('addViewTask', {
          b, writes,
          task: {
            id: r.id,

            name: `{#DE5757 ${getHeaderValue("From").split(" ")[0]}}, ${getHeaderValue("Subject")} [https://mail.google.com/mail?authuser=${rootState.user.email}#all/${m.id} Direct link], {#888888 ${mom.unix(m.internalDate / 1000).format("LLL")}}`,
            notes: `Snippet: ${m.snippet}`,
            priority: '',
            taskDuration: null,
            deadline: '',
            folder: null,
            group: null,
            list: null,
            calendar: null,
            heading: null,
            headingId: null,
            tags: [],
            checklist: [],
            order: [],
            files: [],
          }
        })
      })


      cacheBatchedItems(b, writes)

      return b.commit()
    },
    saveTaskTimelineByIds({rootState, getters}, {ids, time, date}) {
      const writes = []
      const b = fire.batch()

      const items = getters.getTasksById(ids)

      items.forEach(t => {
        let calendar = getters.getSpecificDayCalendarObj(date)
        let taskDuration = t.taskDuration || '00:15'
        calendar.time = time

        const height = rootState.height

        const timeOffset = timeline.convertMinToOffset(
          timeline.getFullMin(time), height
        )
        const durationOffset = timeline.convertMinToOffset(
          timeline.getFullMin(taskDuration), height
        )

        if ((timeOffset + durationOffset) >= height) {
          calendar.time = timeline.formatMin(
            timeline.convertOffsetToMin(height - durationOffset, height), false
            )
        }
        
        setTask(b, {
          calendar, taskDuration,
        }, rootState, t.id, writes)
      })

      cacheBatchedItems(b, writes)

      return b.commit()
    },
    async addTask({rootState}, obj) {
      const b = fire.batch()

      await setTask(b, {
        userId: uid(),
        createdFire: new Date(),
        created: mom().format('Y-M-D HH:mm ss'),
        ...obj,
      }, rootState, obj.id)

      b.commit()
    },
    addMultipleTasks({rootState}, tasks) {
      const b = fire.batch()

      const writes = []
      const pros = []
      
      for (const t of tasks) {
        const ref = taskRef()
        pros.push(
          setTask(b, {
            ...t,
            createdFire: new Date(),
            created: mom().format('Y-M-D HH:mm ss'),
            userId: uid(),
            id: ref.id,
          }, rootState, ref.id, writes)
        )
      }

      cacheBatchedItems(b, writes)
      Promise.all(pros).then(() => {
        b.commit()
      })
    },
    saveTask({rootState}, obj) {
      const b = fire.batch()
      setTask(b, obj, rootState, obj.id).then(() => {
        b.commit()
      })
    },
    deleteTasks({rootState}, ids) {
      const b = fire.batch()

      batchDeleteTasks(b, ids, rootState)

      b.commit()
    },
    saveSchedule({rootState}, {date, schedule}) {
      const b = fire.batch()
      
      setInfo(b, {
        calendarOrders: {
          [date]: {schedule},
        }
      }, rootState)

      b.commit()
    },
    convertTasksToListByIndex({rootState}, {tasks, folder, group, order, savedLists, indicies}) {
      const tasksWithConflictingListNames = {}

      tasks.forEach(task => {
        if (savedLists.find(l => l.name === task.name))
          tasksWithConflictingListNames[task.id] = true
      })
      
      const b = fire.batch()

      const writes = []

      tasks.forEach(task => {

        const list = listRef(task.id)
        deleteTask(b, task.id, rootState, writes)

        const subIds = []
        if (task.checklist)
          for (const t of task.checklist) {
            setTask(b, {
              folder: null,
              group,
              userId: uid(),
              name: t.name,
              createdFire: new Date(),
              created: mom().format('Y-M-D HH:mm ss'),
              id: t.id,
              priority: '',
              list: list.id,
              calendar: null,
              heading: null,
              tags: [],
              checklist: [],
              order: [],
            }, rootState, t.id, writes)
            subIds.push(t.id)
          }

        setList(b, {
          userId: uid(),
          smartViewsOrders: {},
          folder,
          group,
          createdFire: new Date(),
          created: mom().format('Y-M-D HH:mm ss'),
          name: tasksWithConflictingListNames[task.id] ? task.name + ' (list)' : task.name,
          notes: task.notes || null,
          tags: task.tags || [],
          assigned: task.assigned || null,
          tasks: subIds,
          headings: [],
          headingsOrder: [],
        }, list.id, rootState, writes)
        
      })

      if (folder)
        setFolder(b, {order}, folder, rootState, writes)
      else if (group)
        setGroup(b, {listsOrder: order}, group, rootState, writes)

      cacheBatchedItems(b, writes)
      
      b.commit()
    },
    convertToList({rootState}, {task, savedLists}) {
      const existingList = savedLists.find(l => l.name === task.name)
      if (!existingList) {
        const b = fire.batch()
  
        let folder = null
        let group = null
        if (task.list) {
          const list = savedLists.find(l => l.id === task.list)
          if (list && list.folder) folder = list.folder
        }
        if (task.folder)
          folder = task.folder
        if (task.group) {
          group = task.group
        }

        const writes = []
  
        const list = listRef()
        deleteTask(b, task.id, rootState, writes)
        
        const ids = []
        if (task.checklist)
        for (const t of task.checklist) {
          setTask(b, {
            id: t.id,
            createdFire: new Date(),
            created: mom().format('Y-M-D HH:mm ss'),
            cloud_function_edit: false,
            folder: null,
            group,
            userId: uid(),
            name: t.name,
            priority: '',
            list: list.id,
            calendar: null,
            heading: null,
            tags: [],
            checklist: [],
            order: [],
          }, rootState, t.id, writes)
          ids.push(t.id)
        }
  
        setList(b, {
          folder,
          group,
          userId: uid(),
          createdFire: new Date(),
          created: mom().format('Y-M-D HH:mm ss'),
          users: [uid()],
          assigned: task.assigned || null,
          smartViewsOrders: {},
          name: task.name,
          notes: task.notes || null,
          tags: task.tags || [],
          descr: '',
          tasks: ids,
          headings: [],
          headingsOrder: [],
        }, list.id, rootState, writes)

        cacheBatchedItems(b, writes)
  
        b.commit()
      }
    },
    async logTasks({rootState}, tasks) {
      const b = fire.batch()

      const writes = []

      await batchSetTasks(b, {
        logbook: true,
        logFire: new Date(),
        logDate: mom().format('Y-M-D'),
        fullLogDate: mom().format('Y-M-D HH:mm ss'),
      }, tasks, rootState, writes)

      cacheBatchedItems(b, writes)
      
      b.commit()
    },
    async unlogTasks({rootState}, tasks) {
      const b = fire.batch()

      const writes = []

      await batchSetTasks(b, {
        logbook: false,
        logFire: null,
        logDate: null,
        fullLogDate: null,
        completedFire: null,
        completeDate: null,
        completed: false,
        checked: false,
        checkDate: null,
        fullCheckDate: null,
      }, tasks, rootState, writes)

      cacheBatchedItems(b, writes)
      
      b.commit()
    },
    completeTasks({rootState, rootGetters}, tasks) {
      const b = fire.batch()

      const writes = []
      for (const t of tasks) {
        let c
        let calendar = c = t.calendar
        if (c && c.type !== 'someday' && c.type !== 'anytime') {
          if (c.type === 'daily' || c.type === 'after completion' || c.type === 'weekly' || c.type === 'monthly' || c.type === 'yearly') {
            const nextEventAfterCompletion = utilsMoment.getNextEventAfterCompletionDate(c)
            c.lastCompleteDate = nextEventAfterCompletion.format('Y-M-D')
            if (mom(c.lastCompleteDate, 'Y-M-D').isBefore(mom(TODAY_DATE, 'Y-M-D'), 'day'))
              c.lastCompleteDate = TODAY_DATE
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
          checked: true,
          canceled: false,
          cancelDate: null,
          fullCancelDate: null,
          calendar,
        }

        const isNotRecurringTask = !c || (c.type == 'someday' || c.type == 'anytime' || c.type === 'specific')

        const isFromRecurringList = () => {
          if (!t.list)
            return false
          
          const lists = rootGetters['list/lists']
          const l = lists.find(el => el.id === t.list)
          if (l)
            return (l.calendar && l.calendar.type !== 'specific' && l.calendar.type !== 'someday' && l.calendar.type !== 'anytime')
        }

        if ((!rootState.userInfo.manuallyLogTasks && !isFromRecurringList()) && isNotRecurringTask) {
          obj = {
            ...obj,
            logbook: true,
            logFire: new Date(),
            logDate: mom().format('Y-M-D'),
            fullLogDate: mom().format('Y-M-D HH:mm ss'),
          }
        }
        
        setTask(b, obj, rootState, t.id, writes)
      }

      cacheBatchedItems(b, writes)
      
      b.commit()
    },
    uncompleteTasks({commit, rootState}, tasks) {
      const b = fire.batch()

      const writes = []
      for (const t of tasks) {
        const c = t.calendar
        if (c && c.ends) c.ends = null
        if (c) {
          c.lastCompleteDate = null
        }

        setTask(b, {
          completedFire: null,
          completeDate: null,
          completed: false,
          checked: false,
          checkDate: null,
          fullCheckDate: null,
          calendar: c,
        }, rootState, t.id, writes)
      }
      cacheBatchedItems(b, writes)

      b.commit()
    },
    async cancelTasks({rootState}, ids) {
      const b = fire.batch()

      const tod = mom()

      let obj = {
        canceled: true,
        checked: true,
        cancelDate: tod.format('Y-M-D'),
        checkDate: tod.format('Y-M-D'),
        fullCancelDate: tod.format('Y-M-D HH:mm ss'),
        fullCheckDate: tod.format('Y-M-D HH:mm ss'),
        completedFire: null,
        completeDate: null,
        completed: false,
      }

      if (!rootState.userInfo.manuallyLogTasks) {
        obj = {
          ...obj,
          logbook: true,
          logFire: new Date(),
          logDate: mom().format('Y-M-D'),
          fullLogDate: mom().format('Y-M-D HH:mm ss'),
        }
      }

      await batchSetTasks(b, obj, ids, rootState)

      b.commit()
    },
    async uncancelTasks({rootState}, ids) {
      const b = fire.batch()

      await batchSetTasks(b, {
        canceled: false,
        checked: false,
        cancelDate: null,
        checkDate: null,
        fullCancelDate: null,
        fullCheckDate: null,
      }, ids, rootState)

      b.commit()
    },
    async saveTasksById({commit, rootState}, {ids, task}) {
      const b = fire.batch()

      await batchSetTasks(b, task, ids, rootState)

      b.commit()
    },
    async addTagsToTasksById({commit, rootState}, {ids, tagIds}) {
      const b = fire.batch()

      await batchSetTasks(b, {
        tags: fd().arrayUnion(...tagIds),
      }, ids, rootState, undefined, task => {
        Vue.set(task, 'tags', task.tags ? [...task.tags, ...tagIds] : tagIds)
      })

      b.commit()
    },
    async addListToTasksById({rootState}, {ids, listId}) {
      const b = fire.batch()

      const list = rootState.list.lists[listId] || rootState.list.groupLists[listId]

      let group = null
      if (list && list.group)
        group = list.group

      await batchSetTasks(b, {
        list: listId,
        group,
        folder: null,
        heading: null,
      }, ids, rootState)

      b.commit()
    },
    async addTasksToGroupById({rootState}, {ids, groupId}) {
      const b = fire.batch()

      await batchSetTasks(b, {
        list: null,
        folder: null,
        group: groupId,
        heading: null,
      }, ids, rootState)
      
      b.commit()
    },
    async addFolderToTasksById({commit, rootState}, {ids, folderId}) {
      const b = fire.batch()

      await batchSetTasks(b, {
        list: null,
        folder: folderId,
        group: null,
        heading: null,
      }, ids, rootState)
      
      b.commit()
    },
    copyTask(c, task) {
      const b = fire.batch()

      setTask(b, {
        ...task, files: [],
        createdFire: new Date(),
        created: mom().format('Y-M-D HH:mm ss'),
      }, rootState)

      b.commit()
    },
    handleTasksBySidebarElementDragAndDrop({dispatch, getters}, {elIds, taskIds, type}) {
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
        case 'group': {
          dispatch('addTasksToGroupById', {
            groupId: elIds[0],
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
        case 'Anytime': {
          dispatch('saveTasksById', {
            ids: taskIds,
            task: {
              calendar: {type: 'anytime'}
            }
          })
          break
        }
        case 'Logbook': {
          dispatch('logTasks', taskIds)
          break
        }
      }
    },
  },
}
