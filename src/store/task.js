
import { fire, auth } from './index'
import fb from 'firebase/app'

import utils from '../utils'
import utilsTask from '../utils/task'

const uid = () => auth.currentUser.uid
const fd = () => fb.firestore.FieldValue

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
    getSpecificDayCalendarObj: () => moment => {
      return {
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
  },
  actions: {
    getData({state}) {
      if (uid())
      return Promise.all([
        new Promise(resolve => {
          fire.collection('tasks').where('userId', '==', uid()).onSnapshot(snap => {
            utils.getDataFromFirestoreSnapshot(state, snap.docChanges(), 'tasks')
            resolve()
          })
        })
      ])
    },
    addTask(c, obj) {
      const batch = fire.batch()

      const ref = fire.collection('tasks').doc()
      batch.set(ref, {
        userId: uid(),
        ...obj,
      })

      if (obj.listId) {
        const listRef = fire.collection('lists').doc(obj.listId)
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

        const ref = fire.collection('tasks').doc(t.id)
        batch.update(ref, {
          completeDate: mom().format('Y-M-D'),
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
        const ref = fire.collection('tasks').doc(t.id)
        batch.update(ref, {
          completeDate: null,
          completed: false,
          calendar: c,
        })
      }

      batch.commit()
    },
    saveTask(c, obj) {
      fire.collection('tasks').doc(obj.id).update({
        ...obj,
      })
    },
    saveTasksById(c, {ids, task}) {
      const batch = fire.batch()

      for (const id of ids) {
        const ref = fire.collection('tasks').doc(id)
        batch.update(ref, {
          ...task,
        })
      }

      batch.commit()
    },
    addTagsToTasksById(c, {ids, tagIds}) {
      const batch = fire.batch()

      for (const id of ids) {
        const ref = fire.collection('tasks').doc(id)
        batch.update(ref, {
          tags: fd().arrayUnion(...tagIds),
        })
      }
      for (const id of tagIds) {
        const ref = fire.collection('tags').doc(id)
        batch.update(ref, {
          times: fd().increment(1),
        })
      }

      batch.commit()
    },
    addListToTasksById(c, {ids, listId}) {
      const batch = fire.batch()

      for (const id of ids) {
        const ref = fire.collection('tasks').doc(id)
        batch.update(ref, {
          list: listId,
        })
      }

      batch.commit()
    },
    copyTask(c, task) {
      fire.collection('tasks').add({
        ...task,
      })
    },
    deleteTasks(c, ids) {
      const batch = fire.batch()

      for (const id of ids) {
        const ref = fire.collection('tasks').doc(id)
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
  },
}
