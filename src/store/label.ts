
import { Label, List } from '@/interfaces/app'

import { States as RootState } from '@/store/index'

interface States {
  labels: Label[]
  order: string[]
}


interface Getters {
  sortedLabels: () => Label[]
}

interface Mutations {

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
  addLabels: (context: ActionContext) => void
  saveLabelPosition: (context: ActionContext, ids: string[]) => void
  deleteLabelsById: (context: ActionContext, ids: string[]) => void
  [key: string]: (context: ActionContext, payload: any) => any
}

export default {
  namespaced: true,
  state: {
    labels: [],
    order: [],
  } as States,
  mutations: {

  } as Mutations,
  getters: {
    sortedLabels(state: States): Label[] {
      const sorted: Label[] = []
      for (const id of state.order) {
        const lab: Label | undefined = state.labels.find(el => el.id === id)
        if (lab)
          sorted.push(lab)
      }
      return sorted
    },
  } as Getters,
  actions: {
    saveLabelPosition({ state, rootState }, ids) {
      if (rootState.firestore && rootState.uid)
        rootState.firestore.collection('labelsOrder').doc(rootState.uid)
          .update({
            order: ids,
          })
    },
    getData({ rootState, state, dispatch }) {
      if (rootState.firestore && rootState.uid) {
        rootState.firestore.collection('labelsOrder').where('userId', '==', rootState.uid)
          .onSnapshot(snap => {
            const changes = snap.docChanges()
            for (const change of changes)
              state.order = change.doc.data().order
          })
        rootState.firestore.collection('labels').where('userId', '==', rootState.uid)
          .onSnapshot(snap => {
          const changes = snap.docChanges()
          for (const change of changes)
            if (change.type === 'added') {
              const lab = state.labels.find(el => el.id === change.doc.id)
              if (!lab)
                state.labels.push({...change.doc.data(), id: change.doc.id} as any)
            } else if (change.type === 'removed') {
              const index = state.labels.findIndex(el => el.id === change.doc.id)
              state.labels.splice(index, 1)
            } else {
              const index = state.labels.findIndex(el => el.id === change.doc.id)
              state.labels.splice(index, 1, {...change.doc.data(), id: change.doc.id} as any)
            }
        })
      }
    },
    addLabels({ rootState, state }: ActionContext, name: string) {
      if (rootState.firestore && rootState.uid) {
        const batch = rootState.firestore.batch()

        const ref = rootState.firestore.collection('labels').doc()
        batch.set(ref, {
          name,
          userId: rootState.uid,
        })

        const fire: any = rootState.firebase.firestore
        const orderRef = rootState.firestore.collection('labelsOrder').doc(rootState.uid)
        const arr: string[] = state.order
        arr.push(ref.id)
        batch.set(orderRef, {
          userId: rootState.uid,
          order: fire.FieldValue.arrayUnion(...arr),
        })

        batch.commit()
      }
    },
    deleteLabelsById({ rootState, state }: ActionContext, ids: string[]) {
      if (rootState.firestore && rootState.uid) {
        const batch = rootState.firestore.batch()

        for (const id of ids)
          batch.delete(rootState.firestore.collection('labels').doc(id))

        const fire: any = rootState.firebase.firestore 
        const ref = rootState.firestore.collection('labelsOrder').doc(rootState.uid)
        batch.update(ref, {
          order: fire.FieldValue.arrayRemove(...ids)
        })

        console.log('deleted labels')
        batch.commit()
      }
    },
  } as Actions,
}
