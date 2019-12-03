
import { fire, auth } from './index'
import fb from 'firebase/app'

import utils from '../utils'
import utilsTask from '../utils/task'
import utilsMoment from '../utils/moment'
import MemoizeGetters from './memoFunctionGetters'
import { uid, fd, userRef, tagRef, taskColl, taskRef, listRef, addTask } from '../utils/firestore'

import mom from 'moment/src/moment'

const Memoize = {cacheVersion: 0}

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
    filterTasksByCompletion(c, getters) {
      let cache = {}
      let vers = 0
      const calc = (tasks, notCompleted, compareDate) => {
        return tasks.filter(el => {
          const comp = getters.isTaskCompleted(el, compareDate)
          if (notCompleted) return !comp
          return comp
        })
      }
      return (tasks, notCompleted, compareDate) => {
        if (tasks.length === 0) return []
        const key = tasks.reduce((str, t) => str + t.id, '') + 'TASKS_VIEW' + compareDate + notCompleted

        const val = cache[key]
        if (val) {
          if (vers === Memoize.cacheVersion) return val
          else cache = {}
        }

        const res = calc(tasks, notCompleted, compareDate)
        cache[key] = res
        vers = Memoize.cacheVersion
        return res
      }
    },
    isTaskCompleted() {
      let cache = {}
      let vers = 0
      const calc = (task, moment, compareDate) => {
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
            if (times === 0) return true
            if (c.persistent) return c.times === 0
          }
          
          if (c.type === 'periodic' || c.type === 'weekly') {
            const lastComplete = mom(c.lastCompleteDate, 'Y-M-D')
            if (!moment) moment = mom()
            return lastComplete.isSameOrAfter(moment, 'day')
          }
    
          return false
          
          // SLOW AND OLD CODE
          /*       if (!task.calendar || task.calendar.type === 'someday') return task.completed
          if (!moment) moment = mom()
          const {
            type, lastComplete, tod, times,
            persistent, hasTimesBinding, manualComplete
          } = this.taskData(task, moment)
          
          if (type === 'specific') return task.completed
    
          if (manualComplete.isSame(lastComplete, 'day')) return true
          if (hasTimesBinding && times === 0) return true
          if (hasTimesBinding && persistent) return times === 0
          
          if (type === 'periodic' || type === 'weekly') {
            return lastComplete.isSameOrAfter(tod, 'day')
          }
      
          return false */
        }
        let isCompleted = calcTask()
        if (compareDate) {
          if (!task.completeDate) return false
          const taskCompleteDate = mom(task.completeDate, 'Y-M-D')
          const compare = mom(compareDate, 'Y-M-D')
          return isCompleted && taskCompleteDate.isSameOrAfter(compare, 'day')
        }
        return isCompleted
      }
      return (task, moment, compareDate) => {
        let key = '' + task.id
        if (moment) {
          key += moment.format('Y-M-D')
          if (compareDate) key += compareDate
        }
        const val = cache[key]
        if (val) {
          if (vers === Memoize.cacheVersion) return val
          else cache = {}
        }

        const res = calc(task, moment, compareDate)
        cache[key] = res
        vers = Memoize.cacheVersion
        return res
      }
    },
    filterTasksByView(s, getters) {
      let cache = {}
      let vers = 0
      const calc = (tasks, view) => {
        switch (view) {
          case 'Inbox': {
            return tasks.filter(el =>
              !el.completed &&
              !utilsTask.hasCalendarBinding(el) &&
              !el.list &&
              !el.folder &&
              el.tags.length === 0
            )
          }
          case 'Today': {
            return utilsTask.filterTasksByDay(tasks, mom())
          }
          case 'Someday': {
            return tasks.filter(t => t.calendar && t.calendar.type === 'someday')
          }
          case 'Overdue': {
            return tasks.filter(el => {
              if (!utilsTask.hasCalendarBinding(el) || getters.isTaskCompleted(el)) return false
              
              let tod = null
              const getTod = () => {
                if (tod) return tod
                tod = mom()
                return tod
              }
    
              const c = el.calendar
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
              
                /*           if (!utilsTask.hasCalendarBinding(el) || getters.isTaskCompleted(el)) return false
              
              const {
                spec, type, due, tod,
                nextEventAfterCompletion,
                lastComplete, lastWeeklyEvent,
                times, hasTimesBinding
              } = utilsTask.taskData(el, mom())
    
              if (due.isBefore(tod, 'day')) return true
    
              if (type === 'specific') return spec.isBefore(tod, 'day')
              if (hasTimesBinding && times === 0) return true
              if (type === 'periodic') {
                return nextEventAfterCompletion.isBefore(tod, 'day')
              }
              if (type === 'weekly') {
                return lastWeeklyEvent.isAfter(lastComplete, 'day')
              }
    
              return false */
            })
          }
          case 'Tomorrow': {
            return utilsTask.filterTasksByDay(tasks, mom().add(1, 'day'))
          }
          case 'Completed': {
            return getters.filterTasksByCompletion(tasks)
          }
        }
        return tasks
      }
      return (tasks, view) => {
        if (tasks.length === 0) return []
        const key = tasks.reduce((str, t) => str + t.id, '') + 'TASKS_VIEW' + view
        const val = cache[key]
        if (val) {
          if (vers === Memoize.cacheVersion) return val
          else cache = {}
        }

        const res = calc(tasks, view)
        cache[key] = res
        vers = Memoize.cacheVersion
        return res
      }
    },
    ...MemoizeGetters(Memoize, ['tasks'], {
      getNumberOfTasksByTag({getters}, tagId) {
        const ts = state.tasks.filter(el => el.tags.includes(tagId))
  
        return {
          total: ts.length,
          notCompleted: getters.filterTasksByCompletion(ts, true),length,
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
        const ts = getters.filterTasksByView(state.tasks, viewName)

        return {
          total: ts.length,
          notCompleted: getters.filterTasksByCompletion(ts, true).length,
        }
      },
      getLostTasks(c, tasks, list) {
        const headingNames = list.headings.map(el => el.name)
        return tasks.filter(el => !headingNames.includes(el.heading))
      },
      getTasksWithHeading(c, tasks) {
        return tasks.filter(el => el.heading)
      },
      getRootTasksOfList({getters}, tasks, list) {
        return [...getters['tasksWithLists'](tasks).filter(t => !t.heading),...getters['getLostTasks'](tasks, list)]
      },
      getListTasks({getters}, tasks, listId) {
        return getters['tasksWithLists'](tasks).filter(t => t.list === listId)
      },
      tasksWithLists(c, tasks) {
        return tasks.filter(el => el.list)
      },
      tasksWithoutLists(c, tasks) {
        return tasks.filter(el => !el.list)
      },
      tasksWithoutListsAndFolders(c, tasks) {
        return tasks.filter(el => !el.list && !el.folder)
      },
      tasksWithListsOrFolders(c, tasks) {
        return tasks.filter(el => el.list || el.folder)
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
              Memoize.cacheVersion++
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
          const {nextEventAfterCompletion} = utilsTask.taskData(t, mom())
          calendar.lastCompleteDate = nextEventAfterCompletion.format('Y-M-D')
          if (calendar.times) calendar.times -= 1
          if (calendar.times === 0) calendar.times = null
        }

        const ref = taskRef(t.id)
        batch.update(ref, {
          completeDate: mom().format('Y-M-D'),
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
        const ref = taskRef(id)
        batch.update(ref, {
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
      for (const id of tagIds) {
        const ref = tagRef(id)
        batch.update(ref, {
          times: fd().increment(1),
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
