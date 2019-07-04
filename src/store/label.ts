
import { Label, List } from '@/interfaces/app'

import { States as RootState } from '@/store/index'

interface States {
  labels: Label[]
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
  moveLabelBetweenLists: (context: ActionContext, obj: {newList: List, oldList: List}) => void
  [key: string]: (context: ActionContext, payload: any) => any
}

export default {
  namespaced: true,
  state: {
    labels: [],
    update: false,
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
    getData({ rootState, state }) {
      if (rootState.firestore && rootState.uid)
        rootState.firestore.collection('labels')
          .where('userId', '==', rootState.uid).orderBy('name')
          .onSnapshot(snap => {
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
    moveLabelBetweenLists({ rootState, state, getters }: ActionContext, obj) {
      let error: boolean = false
      if (obj.newList.level > obj.oldList.level) {
        const getHeight: any = getters.getNodeHeight as any
        const height: number = getHeight(obj.oldList.elementId, obj.oldList.level)
        if (obj.newList.level + height - obj.oldList.level === 4) {
          error = true
        }
      }
    },
  } as Actions,
}
