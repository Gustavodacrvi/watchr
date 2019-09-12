
import { Task, Label } from '@/interfaces/app'

import { State, Getters, TaskActions } from '@/interfaces/store/task'

import timezone from 'moment-timezone'
import appUtils from '@/utils/app'

interface Actions {
  getData: TaskActions.StoreGetData
  updateTask: TaskActions.StoreUpdateTask
  copyTask: TaskActions.StoreCopyTask
  addTaskPerspective: TaskActions.StoreAddTaskPerspective
  addTaskLabel: TaskActions.StoreAddTaskLabel
  addTask: TaskActions.StoreAddTask
  deleteTasksById: TaskActions.StoreDeleteTasksById
  addMultipleLabelsToMultipleTasks: TaskActions.StoreAddMultipleLabelsToMultipleTasks
  changePrioritysByIds: TaskActions.StoreChangePrioritysByIds
  addSubTask: TaskActions.StoreAddSubTask
  saveSubTask: TaskActions.StoreSaveSubTask
  saveSubtaskOrder: TaskActions.StoreSaveSubtaskOrder
  deleteSubTaskFromTask: TaskActions.StoreDeleteSubTaskFromTask
  saveNewDateOfTasks: TaskActions.StoreSaveNewDateOfTasks
  unCompleteSubtasks: TaskActions.StoreUnCompleteSubtasks
  addProjectTask: TaskActions.StoreAddProjectTask
  removeTasksFromProject: TaskActions.StoreRemoveTasksFromProject
  toggleCompleteTask: TaskActions.StoreToggleCompleteTask
}

export default {
  namespaced: true,
  state: {
    tasks: [],
  } as State,
  mutations: {

  } as {},
  getters: {
    inboxTasks(state) {
      return state.tasks.filter(el => el.labels.length === 0)
    },
    getNumberOfTasksByLabel: state => labelId => {
      const tasks = state.tasks.filter(el => el.labels.includes(labelId))
      return tasks.length
    },
    getTasksByIds: state => ids => {
      const arr: Task[] = []
      for (const id of ids) {
        const task = state.tasks.find(el => el.id === id)
        if (task)
          arr.push(task)
      }
      return arr
    },
  } as Getters,
  actions: {
    getData({ rootState, state }) {
      if (rootState.fr && rootState.uid)
        rootState.fr.collection('tasks').where('userId', '==', rootState.uid).onSnapshot(snap => {
          const changes = snap.docChanges()
          appUtils.fixStoreChanges(state, changes, 'tasks')
        })
    },
    updateTask({ rootState }, {name, priority, projectId, id, saveProject, labels, utc}) {
      const u = timezone().utc()
      const dt = u.format('Y-M-D HH:mm')
      if (rootState.fr && rootState.uid) {
        const fire = rootState.firebase.firestore.FieldValue as any
        const batch = rootState.fr.batch()

        const ref = rootState.fr.collection('tasks').doc(id)
        batch.update(ref, {
          name, priority, labels, projectId,
          lastEditDate: dt,
          ...utc,
        })
        if (projectId && saveProject) {
          const pro = rootState.fr.collection('projects').doc(projectId)
          batch.update(pro, {
            tasks: fire.arrayUnion(ref.id),
          })
        }

        batch.commit()
      }
    },
    deleteTasksById({ rootState }, ids: string[]) {
      if (rootState.fr && rootState.uid) {
        const batch = rootState.fr.batch()

        for (const id of ids) {
          const ref = rootState.fr.collection('tasks').doc(id)
          batch.delete(ref)
        }

        batch.commit()
      }
    },
    addTaskPerspective({ rootState }, {task, perspectiveId, order, position}) {
      const u = timezone().utc()
      const date = u.format('Y-M-D HH:mm')
      if (rootState.fr && rootState.uid) {
        const fire = rootState.firebase.firestore.FieldValue as any
        const batch = rootState.fr.batch()

        const ord = order.slice()
        const ref = rootState.fr.collection('tasks').doc()
        ord.splice(position, 0, ref.id)
        const t = task as any
        batch.set(ref, {
          name: task.name,
          priority: task.priority,
          projectId: task.projectId,
          userId: rootState.uid,
          creationDate: date,
          lastEditDate: date,
          labels: task.labels,
          checklist: [],
          completed: false,
          checklistOrder: [],
          ...t.utc,
        })
        if (task.projectId) {
          const pro = rootState.fr.collection('projects').doc(task.projectId)
          batch.update(pro, {
            tasks: fire.arrayUnion(ref.id),
          })
        }
        const persRef = rootState.fr.collection('perspectives').doc(perspectiveId)
        batch.update(persRef, {
          order: ord,
        })

        batch.commit()
      }
    },
    addProjectTask({ rootState }, {task, projectId, order, position}) {
      const u = timezone().utc()
      const date = u.format('Y-M-D HH:mm')
      if (rootState.fr && rootState.uid) {
        const batch = rootState.fr.batch()

        const ord = order.slice()
        const ref = rootState.fr.collection('tasks').doc()
        ord.splice(position, 0, ref.id)
        const t = task as any
        batch.set(ref, {
          projectId,
          name: task.name,
          priority: task.priority,
          userId: rootState.uid,
          creationDate: date,
          lastEditDate: date,
          labels: task.labels,
          checklist: [],
          completed: false,
          checklistOrder: [],
          ...t.utc,
        })
        const persRef = rootState.fr.collection('projects').doc(projectId)
        batch.update(persRef, {
          tasks: ord,
        })

        batch.commit()
      }
    },
    addTask({ rootState }, {priority, name, labels, utc, projectId}) {
      const u = timezone().utc()
      const date = u.format('Y-M-D HH:mm')
      if (rootState.fr && rootState.uid) {
        const fire = rootState.firebase.firestore.FieldValue as any
        const batch = rootState.fr.batch()

        const ref = rootState.fr.collection('tasks').doc()
        batch.set(ref, {
          name, labels, priority, projectId,
          userId: rootState.uid,
          creationDate: date,
          lastEditDate: date,
          checklist: [],
          completed: false,
          checklistOrder: [],
          ...utc,
        })
        if (projectId) {
          const proRef = rootState.fr.collection('projects').doc(projectId)
          batch.update(proRef, {
            tasks: fire.arrayUnion(ref.id),
          })
        }

        batch.commit()
      }
    },
    changePrioritysByIds({ rootState }, {ids, priority}) {
      const utc = timezone().utc()
      const date = utc.format('Y-M-D HH:mm')
      if (rootState.fr && rootState.uid) {
        const batch = rootState.fr.batch()

        for (const id of ids) {
          const ref = rootState.fr.collection('tasks').doc(id)
          batch.update(ref, {
            priority,
            lastEditDate: date,
          })
        }

        batch.commit()
      }
    },
    addTaskLabel({ rootState }, {task, labelId, order, projectId, position, utc}) {
      const u = timezone().utc()
      const date = u.format('Y-M-D HH:mm')
      if (rootState.fr && rootState.uid) {
        const fire = rootState.firebase.firestore.FieldValue as any
        const batch = rootState.fr.batch()

        const ord = order.slice()
        const ref = rootState.fr.collection('tasks').doc()
        ord.splice(position, 0, ref.id)
        batch.set(ref, {
          projectId: task.projectId,
          name: task.name,
          priority: task.priority,
          userId: rootState.uid,
          labels: task.labels,
          creationDate: date,
          lastEditDate: date,
          checklist: [],
          completed: false,
          checklistOrder: [],
          ...utc,
        })
        const persRef = rootState.fr.collection('labels').doc(labelId)
        batch.update(persRef, {
          order: ord,
        })
        if (task.projectId) {
          const pro = rootState.fr.collection('projects').doc(task.projectId)
          batch.update(pro, {
            tasks: fire.arrayUnion(ref.id),
          })
        }

        batch.commit()
      }
    },
    saveNewDateOfTasks({ rootState }, arr) {
      const u = timezone().utc()
      const date = u.format('Y-M-D HH:mm')
      if (rootState.fr && rootState.uid) {
        const batch = rootState.fr.batch()

        for (const o of arr) {
          const ref = rootState.fr.collection('tasks').doc(o.id)
          batch.update(ref, {
            date: o.date,
            lastEditDate: date,
          })
        }

        batch.commit()
      }
    },
    saveSubtaskOrder({ rootState }, {taskId, order}) {
      const u = timezone().utc()
      const date = u.format('Y-M-D HH:mm')
      if (rootState.fr && rootState.uid)
        rootState.fr.collection('tasks').doc(taskId).update({
          checklistOrder: order,
          lastEditDate: date,
        })
    },
    saveSubTask({ rootState, state }, {taskId, name, id, completed}) {
      const u = timezone().utc()
      const date = u.format('Y-M-D HH:mm')
      if (rootState.fr && rootState.uid) {
        const task = state.tasks.find(el => el.id === taskId) as Task
        const i = task.checklist.findIndex(el => el.id === id) as any
        task.checklist[i] = {
          completed, name, id, taskId,
        }
        rootState.fr.collection('tasks').doc(taskId).update({
          checklist: task.checklist,
          lastEditDate: date,
        })
      }
    },
    deleteSubTaskFromTask({ rootState, state }, {taskId, id}) {
      const u = timezone().utc()
      const date = u.format('Y-M-D HH:mm')
      if (rootState.fr && rootState.uid) {
        const task = state.tasks.find(el => el.id === taskId) as Task
        let i = task.checklist.findIndex(el => el.id === id) as any
        task.checklist.splice(i, 1)

        i = task.checklistOrder.findIndex(el => el === id)
        task.checklistOrder.splice(i, 1)
        rootState.fr.collection('tasks').doc(taskId).update({
          checklist: task.checklist,
          checklistOrder: task.checklistOrder,
          lastEditDate: date,
        })
      }
    },
    addSubTask({ rootState }, {taskId, order, position, name}) {
      const utc = timezone().utc()
      const date = utc.format('Y-M-D HH:mm')
      if (rootState.fr && rootState.uid) {
        const fire = rootState.firebase.firestore.FieldValue as any
        let timesRun = 0
        let newId!: string
        while (true) {
          newId = '' + (order.length + timesRun)
          let found = false
          for (const id of order)
            if (id === newId) {
              found = true
              break
            }
          timesRun++
          if (!found) break
        }
        const subtask = {
          completed: false,
          name, id: newId,
          taskId,
        }
        order.splice(position, 0, newId)
        rootState.fr.collection('tasks').doc(taskId).update({
          checklistOrder: order,
          checklist: fire.arrayUnion(subtask),
          lastEditDate: date,
        })
      }
    },
    removeTasksFromProject({ rootState }, ids) {
      if (rootState.fr && rootState.uid) {
        const batch = rootState.fr.batch()

        for (const id of ids) {
          const ref = rootState.fr.collection('tasks').doc(id)
          batch.update(ref, {
            projectId: '',
          })
        }

        batch.commit()
      }
    },
    toggleCompleteTask({ rootState }, {id, completed}) {
      const utc = timezone().utc()
      const date = utc.format('Y-M-D HH:mm')
      if (rootState.fr && rootState.uid)
        rootState.fr.collection('tasks').doc(id).update({
          completed, lastEditDate: date,
        })
    },
    copyTask({ rootState, state }, taskId) {
      const u = timezone().utc()
      const date = u.format('Y-M-D HH:mm')

      if (rootState.fr && rootState.uid) {
        const task = state.tasks.find(el => el.id === taskId)
        if (task) {
          const batch = rootState.fr.batch()
          const ref = rootState.fr.collection('tasks').doc()
          batch.set(ref, {
            checklist: task.checklist,
            checklistOrder: task.checklistOrder,
            labels: task.labels,
            creationDate: date,
            lastEditDate: date,
            projectId: task.projectId,
            date: task.date,
            time: task.time,
            name: task.name,
            priority: task.priority,
            userId: task.userId,
          } as Task)
          batch.commit()
        }
      }
    },
    unCompleteSubtasks({ rootState, state }, taskId) {
      const u = timezone().utc()
      const date = u.format('Y-M-D HH:mm')
      if (rootState.fr && rootState.uid) {
        const task = state.tasks.find(el => el.id === taskId)
        if (task) {
          for (const sub of task.checklist)
            sub.completed = false
          rootState.fr.collection('tasks').doc(taskId).update({
            checklist: task.checklist,
            lastEditDate: date,
          })
        }
      }
    },
    addMultipleLabelsToMultipleTasks({ rootState, state }, {taskIds, labIds}) {
      if (rootState.fr && rootState.uid) {
        const batch = rootState.fr.batch()
        const fire = rootState.firebase.firestore.FieldValue as any

        for (const id of taskIds) {
          const ref = rootState.fr.collection('tasks').doc(id)
          batch.update(ref, {
            labels: fire.arrayUnion(...labIds),
          })
        }

        batch.commit()
      }
    },
  } as Actions,
}
