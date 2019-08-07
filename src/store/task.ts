
import { Task, Label } from '@/interfaces/app'

import { States as RootState } from '@/store/index'

interface States {
  tasks: Task[]
}

interface Getters {
  inboxTasks: (state: States) => Task[]
  getNumberOfTasksByLabel: (state: States) => (labelId: string) => number
}

interface Mutations {

}

interface ActionContext {
  state: States
  getters: Getters
  commit: (mutation: string, payload?: any) => void
  dispatch: (action: string, payload?: any) => void
  rootState: RootState
}

interface Actions {
  // tslint:disable-next-line:max-line-length
  updateTask: (context: ActionContext, obj: {name: string, priority: string, id: string, labels: []}) => void
  copyTask: (context: ActionContext, id: string) => void
  // tslint:disable-next-line:max-line-length
  addTaskPerspective: (context: ActionContext, obj: {task: Task, perspectiveId: string, position: number, order: string[]}) => void
  addTaskLabel: (context: ActionContext, obj: {task: Task, labelId: string, position: number, order: string[]}) => void
  addTask: (context: ActionContext, obj: {name: string, priority: string, labels: string[]}) => void
  deleteTasksById: (context: ActionContext, ids: string[]) => void
  changePrioritysByIds: (context: ActionContext, obj: {ids: string[], priority: string}) => void
  addSubTask: (context: ActionContext, obj: {name: string, taskId: string, position: number, order: string[]}) => void
  addLabelByTaskIds: (context: ActionContext, obj: {ids: string[], labelId: string}) => void
  saveSubTask: (context: ActionContext, obj: {name: string, taskId: string, completed: boolean, id: string}) => void
  saveSubtaskOrder: (context: ActionContext, obj: {taskId: string, order: string[]}) => void
  deleteSubTaskFromTask: (context: ActionContext, obj: {taskId: string, id: string}) => void
  unCompleteSubtasks: (context: ActionContext, taskId: string) => void
  [key: string]: (context: ActionContext, payload: any) => any
}

export default {
  namespaced: true,
  state: {
    tasks: [],
  } as States,
  mutations: {

  } as Mutations,
  getters: {
    inboxTasks(state: States) {
      return state.tasks.filter(el => el.labels.length === 0)
    },
    getNumberOfTasksByLabel: (state: States) => (labelId: string): number => {
      const tasks = state.tasks.filter(el => el.labels.includes(labelId))
      return tasks.length
    },
  } as Getters,
  actions: {
    getData({ rootState, state }) {
      if (rootState.firestore && rootState.uid)
        rootState.firestore.collection('tasks').where('userId', '==', rootState.uid).onSnapshot(snap => {
          const changes = snap.docChanges()
          for (const change of changes)
            if (change.type === 'added') {
              const lab = state.tasks.find(el => el.id === change.doc.id)
              if (!lab)
                state.tasks.push({...change.doc.data(), id: change.doc.id} as any)
            } else if (change.type === 'removed') {
              const index = state.tasks.findIndex(el => el.id === change.doc.id)
              state.tasks.splice(index, 1)
            } else {
              const index = state.tasks.findIndex(el => el.id === change.doc.id)
              state.tasks.splice(index, 1, {...change.doc.data(), id: change.doc.id} as any)
            }
        })
    },
    updateTask({ rootState }, {name, priority, id, labels}) {
      if (rootState.firestore && rootState.uid)
        rootState.firestore.collection('tasks').doc(id).update({
          name, priority, labels,
        })
    },
    deleteTasksById({ rootState }, ids: string[]) {
      if (rootState.firestore && rootState.uid) {
        const batch = rootState.firestore.batch()

        for (const id of ids) {
          const ref = rootState.firestore.collection('tasks').doc(id)
          batch.delete(ref)
        }

        batch.commit()
      }
    },
    addTaskPerspective({ rootState }, {task, perspectiveId, order, position}) {
      if (rootState.firestore && rootState.uid) {
        const batch = rootState.firestore.batch()

        const ord = order.slice()
        const ref = rootState.firestore.collection('tasks').doc()
        ord.splice(position, 0, ref.id)
        batch.set(ref, {
          name: task.name,
          priority: task.priority,
          userId: rootState.uid,
          labels: task.labels,
          checklist: [],
          checklistOrder: [],
        })
        const persRef = rootState.firestore.collection('perspectives').doc(perspectiveId)
        batch.update(persRef, {
          order: ord,
        })

        batch.commit()
      }
    },
    addTask({ rootState }, {priority, name, labels}) {
      if (rootState.firestore && rootState.uid)
        rootState.firestore.collection('tasks').add({
          name, labels, priority,
          userId: rootState.uid,
          checklist: [],
          checklistOrder: [],
        })
    },
    changePrioritysByIds({ rootState }, {ids, priority}) {
      if (rootState.firestore && rootState.uid) {
        const batch = rootState.firestore.batch()

        for (const id of ids) {
          const ref = rootState.firestore.collection('tasks').doc(id)
          batch.update(ref, {
            priority,
          })
        }

        batch.commit()
      }
    },
    addLabelByTaskIds({ rootState }, {ids, labelId}) {
      if (rootState.firestore && rootState.uid) {
        const batch = rootState.firestore.batch()

        const fire = rootState.firebase.firestore.FieldValue as any
        for (const id of ids) {
          const ref = rootState.firestore.collection('tasks').doc(id)
          batch.update(ref, {
            labels: fire.arrayUnion(labelId),
          })
        }

        batch.commit()
      }
    },
    addTaskLabel({ rootState }, {task, labelId, order, position}) {
      if (rootState.firestore && rootState.uid) {
        const batch = rootState.firestore.batch()

        const ord = order.slice()
        const ref = rootState.firestore.collection('tasks').doc()
        ord.splice(position, 0, ref.id)
        batch.set(ref, {
          name: task.name,
          priority: task.priority,
          userId: rootState.uid,
          labels: task.labels,
          checklist: [],
          checklistOrder: [],
        })
        const persRef = rootState.firestore.collection('labels').doc(labelId)
        batch.update(persRef, {
          order: ord,
        })

        batch.commit()
      }
    },
    saveSubtaskOrder({ rootState }, {taskId, order}) {
      if (rootState.firestore && rootState.uid)
        rootState.firestore.collection('tasks').doc(taskId).update({
          checklistOrder: order,
        })
    },
    saveSubTask({ rootState, state }, {taskId, name, id, completed}) {
      if (rootState.firestore && rootState.uid) {
        const task = state.tasks.find(el => el.id === taskId) as Task
        const i = task.checklist.findIndex(el => el.id === id) as any
        task.checklist[i] = {
          completed, name, id, taskId,
        }
        rootState.firestore.collection('tasks').doc(taskId).update({
          checklist: task.checklist,
        })
      }
    },
    deleteSubTaskFromTask({ rootState, state }, {taskId, id}) {
      if (rootState.firestore && rootState.uid) {
        const task = state.tasks.find(el => el.id === taskId) as Task
        let i = task.checklist.findIndex(el => el.id === id) as any
        task.checklist.splice(i, 1)

        i = task.checklistOrder.findIndex(el => el === id)
        task.checklistOrder.splice(i, 1)
        rootState.firestore.collection('tasks').doc(taskId).update({
          checklist: task.checklist,
          checklistOrder: task.checklistOrder,
        })
      }
    },
    addSubTask({ rootState }, {taskId, order, position, name}) {
      if (rootState.firestore && rootState.uid) {
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
        rootState.firestore.collection('tasks').doc(taskId).update({
          checklistOrder: order,
          checklist: fire.arrayUnion(subtask),
        })
      }
    },
    copyTask({ rootState, state }, taskId) {
      if (rootState.firestore && rootState.uid) {
        const task = state.tasks.find(el => el.id === taskId)
        if (task) {
          const batch = rootState.firestore.batch()
          const ref = rootState.firestore.collection('tasks').doc()
          batch.set(ref, {
            checklist: task.checklist,
            checklistOrder: task.checklistOrder,
            labels: task.labels,
            name: task.name,
            priority: task.priority,
            userId: task.userId,
          } as Task)
          batch.commit()
        }
      }
    },
    unCompleteSubtasks({ rootState, state }, taskId) {
      if (rootState.firestore && rootState.uid) {
        const task = state.tasks.find(el => el.id === taskId)
        if (task) {
          for (const sub of task.checklist)
            sub.completed = false
          rootState.firestore.collection('tasks').doc(taskId).update({
            checklist: task.checklist,
          })
        }
      }
    },
  } as Actions,
}
