
import { fire, auth } from './index'
import fb from 'firebase/app'

import utils from '../utils'
import utilsTask from '../utils/task'
import utilsMoment from '../utils/moment'
import MemoizeGetters from './memoFunctionGetters'
import { uid, fd, userRef, serverTimestamp, tagRef, taskColl, taskRef, listRef, addTask } from '../utils/firestore'

import mom from 'moment/src/moment'

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
    getSpecificDayCalendarObj: () => (moment, cal) => {
      const obj = {
        defer: null,
        due: null,
  
        type: 'specific',
        time: null,
        editDate: mom().format('Y-M-D'),
  
        specific: moment.format('Y-M-D'),
        lastCompleteDate: null,
        times: null,
        periodic: null
      }
      if (cal) {
        obj.time = cal.time
        obj.times = cal.times
        obj.persistent = cal.persistent
      }
      return obj
    },
    ...MemoizeGetters([], {
      isCalendarObjectShowingToday({}, calendar, date, specific) {
        const c = calendar  
        if (!calendar) return false
        if (specific && c.type !== 'specific') return false
        if (c.type === 'someday') return false
        // SPECIFIC
        if (c.type === 'specific') {
          return date === c.specific
        }
        // overdue
        const tod = mom(date, 'Y-M-D')
        if (c.due) {
          const due = mom(c.due, 'Y-M-D')
          if (due.isBefore(tod, 'day')) return false
        }
        // not ready yet
        if (c.defer) {
          const defer = mom(c.defer, 'Y-M-D')
          if (defer.isAfter(tod, 'day')) return false
        }
        if (c.persistent && c.times !== null && c.times !== undefined) return true
        if (c.type === 'periodic') {
          const dayDiff = tod.diff(mom(c.editDate, 'Y-M-D'), 'day')
          const eventNotToday = dayDiff % c.periodic !== 0
          if (eventNotToday) return false  
        }
        if (c.type === 'weekly') {
          const todaysWeekDayName = tod.format('ddd').toLowerCase()
          const eventNotToday = !c.weekly.find(w => w.toLowerCase() === todaysWeekDayName)
          if (eventNotToday) return false
        }
        return true
        
    
        // OLD AND SLOW CODE
          /*     if (calendar.type === 'someday') return false
          const {
            type, defer, due, tod,
            edit, spec, interval,
            weekDays, times, persistent,
            hasTimesBinding,
          } = this.getCalendarObjectData(calendar, todayMoment)
          const isOverdue = (due.isBefore(tod, 'day'))
          const isntReadyYet = (defer.isAfter(tod, 'day'))
          const notToday = (!tod.isSame(spec, 'day'))
          const isForToday = !notToday
      
          if (isOverdue) return false
          if (isntReadyYet) return false
          
          if (type === 'specific') return isForToday
          // if it passes here, then the calendar is guaranted to be periodic or weekly
          if (persistent && hasTimesBinding) return true
          if (type === 'periodic') {
            const dayDiff = tod.diff(edit, 'day')
            const eventNotToday = dayDiff % interval !== 0
            if (eventNotToday) return false
          }
          if (type === 'weekly') {
            const todaysWeekDayName = tod.format('ddd').toLowerCase()
            const eventNotToday = !weekDays.find(w => w.toLowerCase() === todaysWeekDayName)
            if (eventNotToday) return false
          }
      
          return true */
      },
      isTaskCompleted: {
        getter({}, task, moment, compareDate) {
          const calcTask = () => {
            const c = task.calendar
            if (!c || c.type === 'someday' || c.type === 'specific') return task.completed
            
            if (c.manualComplete && c.lastCompleteDate) {
              const manualComplete = mom(c.manualComplete, 'Y-M-D')
              const lastComplete = mom(c.lastCompleteDate, 'Y-M-D')
              if (manualComplete.isSame(lastComplete, 'day')) return true
            }
            // const hasTimesBinding = c.times !== null && c.times !== undefined
            if (c.times !== null && c.times !== undefined) {
              if (c.times === 0) return true
              if (c.persistent) return c.times === 0
            }
            moment = mom(moment, 'Y-M-D')
            if (c.type === 'periodic' || c.type === 'weekly') {
              const lastComplete = mom(c.lastCompleteDate, 'Y-M-D')
              if (!moment) moment = mom()
              return lastComplete.isSameOrAfter(moment, 'day')
            }
      
            return false
          }
          let isCompleted = calcTask()
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
      isTaskPeriodic: {
        getter({}, task) {
          return task.calendar && task.calendar.type === 'periodic'
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
      isTaskInView: {
        getter({getters}, task, view) {
          switch (view) {
            case 'Inbox': return getters.isTaskInbox(task)
            case 'Today': return getters.isTaskShowingOnDate(task, TODAY_DATE)
            case 'Someday': return getters.isTaskSomeday(task)
            case 'Overdue': return getters.isTaskOverdue(task)
            case 'Tomorrow': return getters.isTaskShowingOnDate(task, TOM_DATE)
            case 'Completed': return getters.isTaskCompleted(task)
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
              obj = t.calendar
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
      isTaskOverdue: {
        getter({}, task) {
          const calendar = task.calendar
          if (!calendar) return false
          
          let tod = null
          const getTod = () => {
            if (tod) return tod
            tod = mom()
            return tod
          }
  
          const c = calendar
          if (c.due) {
            const due = mom(c.due, 'Y-M-D')
            if (due.isBefore(getTod(), 'day')) return true
          }
          if (c.type === 'specific') {
            const spec = mom(c.specific, 'Y-M-D')
            return spec.isBefore(getTod(), 'day')
          }
          if (c.times !== null && c.times !== undefined && c.times === 0)
            return true
          if (c.type === 'periodic') {
            return utilsMoment.getNextEventAfterCompletionDate(c).isBefore(getTod(), 'day')
          }
          if (c.type === 'weekly') {
            const lastWeeklyEvent = utilsMoment.getLastWeeklyEvent(c, getTod())
            const lastComplete = mom(c.lastCompleteDate, 'Y-M-D')
            return lastWeeklyEvent.isAfter(lastComplete, 'day')
          }
  
          return false
        },
        cache(args) {
          return JSON.stringify(args[0].calendar)
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
          // overdue
          if (c.due) {
            const due = mom(c.due, 'Y-M-D')
            return due.isSameOrAfter(first, period)
          }
          if (c.defer) {
            const defer = mom(c.defer, 'Y-M-D')
            return defer.isSameOrBefore(last, period)
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
        getter({}, task, tags) {
          return tags.every(id => !task.tags.includes(id))
        },
        cache(args) {
          if (args[1].length === 0)
            return ''
          return JSON.stringify({k: args[0].tags, t: args[1]})
        }
      },
      doesTaskPassInclusiveTags: {
        getter({}, task, tags) {
          return tags.every(id => task.tags.includes(id))
        },
        cache(args) {
          return JSON.stringify({k: args[0].tags, t: args[1]})
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
          return task.heading === heading.name
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
    ...MemoizeGetters(['tasks'], {
      getNumberOfTasksByTag({getters, state}, tagId) {
        const ts = state.tasks.filter(
          task => getters.doesTaskPassInclusiveTags(task, [tagId])
        )
  
        return {
          total: ts.length,
          notCompleted: ts.filter(
            task => !getters.isTaskCompleted(task)
          ).length,
        }
      },
      getTasksById({state}, ids) {
        const arr = []
        for (const id of ids) {
          const task = state.tasks.find(el => el.id === id)
          if (task) arr.push(task)
        }
        return arr
      },
      getNumberOfTasksByView({state, getters}, viewName) {
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
    convertToList(c, {task, savedLists}) {
      const batch = fire.batch()

      let folder = null
      if (task.list) {
        const list = savedLists.find(l => l.id === task.list)
        if (list && list.folder) folder = list.folder
      }

      const list = listRef()
      const oldTask = taskRef(task.id)
      batch.delete(oldTask)
      
      const ids = []
      if (task.checklist)
        for (const t of task.checklist) {
          const ref = taskRef(t.id)
          batch.set(ref, {
            folder,
            userId: uid(),
            users: [uid()],
            name: t.name,
            priority: '',
            list: list.id,
            notes: t.notes,
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
        descr: '',
        tasks: ids,
        headings: [],
        headingsOrder: [],
      })

      batch.commit()
    },
    completeTasks(c, tasks) {
      const batch = fire.batch()

      for (const t of tasks) {
        let calendar = t.calendar
        if (calendar && calendar.type !== 'someday') {
          const nextEventAfterCompletion = utilsMoment.getNextEventAfterCompletionDate(calendar)
          calendar.lastCompleteDate = nextEventAfterCompletion.format('Y-M-D')
          if (calendar.times) calendar.times -= 1
          if (calendar.times === 0) calendar.times = null
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
    manualCompleteTasks(c, tasks) {
      const batch = fire.batch()

      for (const t of tasks) {
        const ref = taskRef(t.id)
        t.calendar.manualComplete = t.calendar.lastCompleteDate
        batch.update(ref, {
          calendar: t.calendar
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
    handleTasksByAppnavElementDragAndDrop({dispatch, getters}, {elIds, taskIds, type}) {
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
