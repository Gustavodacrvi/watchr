
import { SmartPerspective, Task } from '@/interfaces/app'

import { States as RootState } from '@/store/index'

interface States {
  tasks: Task[]
}

interface Getters {

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
  addTask: (context: ActionContext, task: {name: string, priority: string}) => void
  [key: string]: (context: ActionContext, payload: any) => any
}

export default {
  namespaced: true,
  state: {

  } as States,
  mutations: {

  } as Mutations,
  getters: {

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
    addTask({ rootState }, task) {
      if (rootState.firestore && rootState.uid)
        rootState.firestore.collection('tasks').add({
          name: task.name,
          priority: task.priority,
          userId: rootState.uid,
          labels: [],
        })
    },
  } as Actions,
}
