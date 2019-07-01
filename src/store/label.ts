
import { Label } from '@/interfaces/app'

import { States as RootState } from '@/store/index'

interface States {
  labels: Label[]
}

interface Mutations {

}

interface Getters {

}

interface ActionContext {
  state: States
  getters: Getters
  commit: (mutation: string, payload?: any) => void
  dispatch: (action: string) => void
  rootState: RootState
}

interface Actions {
  getData: (context: ActionContext) => void
  [key: string]: (context: ActionContext, payload: any) => any
}

export default {
  namespaced: true,
  state: {
    labels: [],
  } as States,
  mutations: {

  } as Mutations,
  getters: {

  } as Getters,
  actions: {
    getData({ rootState, state }) {
      if (rootState.firestore)
        // I am inevitable
        rootState.firestore.collection('labels').onSnapshot(snap => {
          for (const change of snap.docChanges()) {
            if (change.type === 'added')
              state.labels.push({...change.doc.data(), id: change.doc.id} as any)
          }
        })
    },
  } as Actions,
}
