
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

      return batch.commit()
    },
    completeTasks(c, {ids, calendar}) {
      const batch = fire.batch()

      for (const id of ids) {
        const ref = fire.collection('tasks').doc(id)
        batch.update(ref, {
          completeDate: mom().format('Y-M-D'),
          completed: true,
          calendar,
        })
      }
      
      return batch.commit()
    },
    saveTask(c, obj) {
      return fire.collection('tasks').doc(obj.id).update({
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

      return batch.commit()
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

      return batch.commit()
    },
    copyTask(c, task) {
      return fire.collection('tasks').add({
        ...task,
      })
    },
    deleteTasks(c, ids) {
      const batch = fire.batch()

      for (const id of ids) {
        const ref = fire.collection('tasks').doc(id)
        batch.delete(ref)
      }

      return batch.commit()
    },
  },
}
