
import { Label } from '@/interfaces/app'

import { States as RootState } from '@/store/index'

interface States {
  labels: Label[]
}

interface Mutations {

}

interface Getters {
  rootLabels: () => Label[]
  getSubLabelsFromIds: () => (ids: string[]) => Label[]
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
  updateLabels: (context: ActionContext) => void
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
    rootLabels(state: States): Label[] {
      return state.labels.filter(el => el.level === 0)
    },
    getSubLabelsFromIds: (state: States) => (ids: string[]): Label[] => {
      return state.labels.filter(el => ids.includes(el.id))
    },
  } as Getters,
  actions: {
    getData({ rootState, state }) {
      if (rootState.firestore && rootState.uid)
        rootState.firestore.collection('labels')
          .where('userId', '==', rootState.uid).onSnapshot(snap => {
          for (const change of snap.docChanges())
            if (change.type === 'added')
              state.labels.push({...change.doc.data(), id: change.doc.id} as any)
        })
    },
    updateLabels({ rootState }: ActionContext, newLabels: Label[]) {
      if (rootState.firestore) {
        const batch = rootState.firestore.batch()

        for (const label of newLabels) {
          const ref = rootState.firestore.collection('labels').doc(label.id)
          batch.set(ref, {
            name: label.name,
            level: label.level,
            userId: label.userId,
            subLabels: label.subLabels,
          } as Label)
        }

        batch.commit()
      }
    },
  } as Actions,
}
