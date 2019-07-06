
import { Label, List } from '@/interfaces/app'

import { States as RootState } from '@/store/index'
import { State } from 'vuex-class';

interface States {
  labels: Label[]
  order: string[]
}


interface Getters {
  rootLabels: () => Label[]
  getSubLabelsFromIds: () => (ids: string[]) => Label[]
  getNodeHeight: () => (id: string, level: number) => number
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
    rootLabels(state: States): Label[] {
      const labels: Label[] = state.labels.filter(el => el.level === 0)
      const sorted: Label[] = []
      for (const id of state.order) {
        const lab: Label | undefined = labels.find(el => el.id === id)
        if (lab)
          sorted.push(lab)
      }
      return sorted
    },
    getSubLabelsFromIds: (state: States) => (ids: string[]): Label[] => {
      const labels: Label[] = state.labels.filter(el => ids.includes(el.id))
      const sorted: Label[] = []
      for (const id of state.order) {
        const lab: Label | undefined = labels.find(el => el.id === id)
        if (lab)
          sorted.push(lab)
      }
      return sorted
    },
    getNodeHeight: (state: States, getters: Getters) => (labelId: string, labelLevel: number): number => {
      const getHeight: any = getters.getNodeHeight
      const walk = (id: string, level: number): number => {
        const label: Label = state.labels.find(el => el.id === id) as Label
        if (label.subLabels.length === 0) {
          return level
        } else {
          const heights: number[] = []
          for (const labId of label.subLabels)
            heights.push(getHeight(labId, level + 1))
          let max: number = 0
          for (const height of heights)
            if (height > max)
              max = height
          return max
        }
      }
      return walk(labelId, labelLevel)
    },
  } as Getters,
  actions: {
    saveLabelPosition({ state, rootState }, ids) {
      console.log('save position')
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
            console.log('order snap')
            const changes = snap.docChanges()
            for (const change of changes)
              state.order = change.doc.data().order
          })
        rootState.firestore.collection('labels').where('userId', '==', rootState.uid)
          .onSnapshot(snap => {
          console.log('labels snap')
          const changes = snap.docChanges()
          for (const change of changes) {
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
          }
        })
      }
    },
    addLabels({ rootState, state }: ActionContext, name: string) {
      if (rootState.firestore && rootState.uid) {
        const batch = rootState.firestore.batch()

        const ref = rootState.firestore.collection('labels').doc()
        batch.set(ref, {
          name: name,
          userId: rootState.uid
        })

        const fire: any = rootState.firebase.firestore
        const orderRef = rootState.firestore.collection('labelsOrder').doc(rootState.uid)
        batch.set(orderRef, {
          userId: rootState.uid,
          order: fire.FieldValue.arrayUnion(ref.id)
        })

        console.log('add tag')
        batch.commit()
      }
    },
  } as Actions,
}
