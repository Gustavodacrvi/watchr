
import { Label, List } from '@/interfaces/app'

import { States as RootState } from '@/store/index'
import { State } from 'vuex-class';

interface States {
  labels: Label[]
  order: string[]
  update: boolean
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
  updateLabels: (context: ActionContext) => void
  moveLabelBetweenLists: (context: ActionContext, arr: {newList: List, oldList: List}[]) => void
  sort: (context: ActionContext) => void
  savePosition: (context: ActionContext) => void
  [key: string]: (context: ActionContext, payload: any) => any
}

export default {
  namespaced: true,
  state: {
    labels: [],
    update: false,
    order: [],
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
    sort({ state }) {
      const sorted: Label[] = []
      for (const id of state.order) {
        const lab: Label | undefined = state.labels.find(el => el.id === id)
        if (lab)
          sorted.push(lab)
      }
      state.labels = sorted
    },
    savePosition({ state, rootState }) {
      const ids: string[] = []
      for (const lab of state.labels)
        ids.push(lab.id)
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
            dispatch('sort')
          })
        rootState.firestore.collection('labels').where('userId', '==', rootState.uid)
          .onSnapshot(snap => {
          const changes = snap.docChanges()
          for (const change of changes) {
            if (change.type === 'added')
              state.labels.push({...change.doc.data(), id: change.doc.id} as any)
            else if (change.type === 'removed') {
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
    updateLabels({ rootState, state }: ActionContext, newLabels: Label[]) {
      if (rootState.firestore && rootState.uid) {
        const batch = rootState.firestore.batch()

        const ids: string[] = []
        const fire: any = rootState.firebase.firestore
        for (const label of newLabels) {
          const ref = rootState.firestore.collection('labels').doc(label.id)
          batch.set(ref, {
            name: label.name,
            level: label.level,
            userId: label.userId,
            subLabels: label.subLabels,
          } as Label)
          ids.push(label.id)
        }
        const ref = rootState.firestore.collection('labelsOrder').doc(rootState.uid)
        if (state.order.length === 0)
          batch.set(ref, {
            userId: rootState.uid,
            order: fire.FieldValue.arrayUnion(...ids),
          })
        else
          batch.update(ref, {
            order: fire.FieldValue.arrayUnion(...ids),
          })

        batch.commit()
      }
    },
    moveLabelBetweenLists({ rootState, state, getters }: ActionContext, movements) {
      if (rootState.firestore && rootState.firebase) {
        const batch = rootState.firestore.batch()
        for (const move of movements) {
          let error: boolean = false
          if (move.newList.level > move.oldList.level) {
            const getHeight: any = getters.getNodeHeight as any
            const height: number = getHeight(move.oldList.elementId, move.oldList.level)
            if (move.newList.level + height - move.oldList.level > 3)
              error = true
          }
          if (!error && rootState.firestore) {
            const fire: any = rootState.firebase.firestore
            if (move.newList.parentId) {
              const ref = rootState.firestore.collection('labels').doc(move.newList.parentId)
              batch.update(ref, {
                subLabels: fire.FieldValue.arrayUnion(move.oldList.elementId)
              })
            }
            if (move.oldList.parentId) {
              const ref = rootState.firestore.collection('labels').doc(move.oldList.parentId)
              batch.update(ref, {
                subLabels: fire.FieldValue.arrayRemove(move.oldList.elementId)
              })
            }
            const ref = rootState.firestore.collection('labels').doc(move.oldList.elementId)
            batch.update(ref, {
              level: move.newList.level
            })
            const updateInnerLevels = (id: string, level: number) => {
              const parent: Label = state.labels.find(el => el.id === id) as Label
              const firestore: firebase.firestore.Firestore = rootState.firestore as any
              for (const id of parent.subLabels) {
                const docRef = firestore.collection('labels').doc(id)
                batch.update(docRef, {
                  level: level
                })
                updateInnerLevels(id, level + 1)
              }
            }
            updateInnerLevels(move.oldList.elementId as string, move.newList.level + 1)
          } else state.update = !state.update
        }
        batch.commit()
      }
    },
  } as Actions,
}
