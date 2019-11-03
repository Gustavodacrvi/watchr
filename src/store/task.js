
import { fire, auth } from './index'
import fb from 'firebase/app'

import utils from '../utils'
import utilsTask from '../utils/task'
import { uid, fd, userRef } from '../utils/firestore'

import mom from 'moment'

export default {
  namespaced: true,
  state: {
    tasks: [],
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
    getNumberOfTasksByTag: state => tagId => {
      const ts = state.tasks.filter(el => el.tags.includes(tagId))

      return {
        total: ts.length,
        notCompleted: utilsTask.filterTasksByCompletion(ts, true),length,
      }
    },
    getTasksById: state => ids => {
      const arr = []
      for (const id of ids) {
        const task = state.tasks.find(el => el.id === id)
        if (task) arr.push(task)
      }
      return arr
    },
    getNumberOfTasksByView: state => viewName => {
      const ts = utilsTask.filterTasksByView(state.tasks, viewName)

      return {
        total: ts.length,
        notCompleted: utilsTask.filterTasksByCompletion(ts, true).length,
      }
    },
    getTasksWithHeading: (s, getters) => {
      return getters.getListTasks.filter(el => el.heading)
    },
    tasksWithLists: state => {
      return state.tasks.filter(el => el.list)
    },
    tasksWithoutLists: state => {
      return state.tasks.filter(el => !el.list)
    },
  },
  actions: {
    getData({state}) {
      const id = uid()
      if (id)
      return Promise.all([
        new Promise(resolve => {
          fire.collection('users').doc(uid()).collection('tasks').onSnapshot(snap => {
            utils.getDataFromFirestoreSnapshot(state, snap.docChanges(), 'tasks')
            resolve()
          })
        })
      ])
    },
    addTask(c, obj) {
      const batch = fire.batch()

      const ref = taskRef()
      batch.set(ref, {
        userId: uid(),
        users: {[uid()]: true},
        ...obj,
      })

      if (obj.listId) {
        const listRef = taskRef(obj.listId)
        batch.update(listRef, {
          tasks: fd().arrayUnion(ref.id),
        })
      }

      batch.commit()
    },
    completeTasks(c, tasks) {
      const batch = fire.batch()

      for (const t of tasks) {
        let calendar = t.calendar
        if (calendar) {
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
    saveTask(c, obj) {
      taskRef(obj.id).update({
        ...obj,
      })
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
        const ref = taskRef(id)
        batch.update(ref, {
          list: listId,
          heading: null,
        })
      }

      batch.commit()
    },
    copyTask(c, task) {
      userRef().collection('tasks').add({
        ...task,
      })
    },
    convertToList(c, task) {
      const batch = fire.batch()

      const list = listRef()
      const oldTask = taskRef(task.id)
      batch.delete(oldTask)
      
      const ids = []
      if (task.checklist)
        for (const t of task.checklist) {
          const ref = taskRef(t.id)
          batch.set(ref, {
            userId: uid(),
            users: {[uid()]: true},
            name: t.name,
            priority: '',
            list: list.id,
            notes: '',
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
        users: {[uid()]: true},
        smartViewsOrders: {},
        name: task.name,
        descr: '',
        tasks: ids,
        headings: [],
        headingsOrder: [],
      })

      batch.commit()
    },
    deleteTasks(c, ids) {
      const batch = fire.batch()

      for (const id of ids) {
        const ref = taskRef(id)
        batch.delete(ref)
      }

      batch.commit()
    },
    handleTasksByAppnavElementDragAndDrop({dispatch, getters}, {elIds, taskIds, type}) {
      const calObj = (mom) => {
        return getters.getSpecificDayCalendarObj(mom)
      }
      switch (type) {
        case 'tag': {
          dispatch('addTagsToTasksById', {
            tagIds: elIds,
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
