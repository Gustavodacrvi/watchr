
import { Label } from '@/interfaces/app'

import uuid from 'uuid'

interface States {
  labels: Label[]
}

interface Mutations {
  addLabelFromArrayPath: (state: States, path: string[]) => void
  [key: string]: (state: States, payload: any) => any
}

interface Getters {
  getLabelNodeFromArrayPath: () => () => Label | undefined
  [key: string]: (state: States, getters: any, rootState: States, rootGetters: any) => any
}

interface ActionContext {
  state: States
  getters: Getters
  commit: (mutation: string, payload?: any) => void
  dispatch: (action: string) => void
}


interface Actions {
  addLabelFromArrayPath: (context: ActionContext, path: string[]) => boolean
  [key: string]: (context: ActionContext, payload: any) => any
}

export default {
  namespaced: true,
  state: {
    labels: [],
  } as States,
  mutations: {
    addLabelFromArrayPath(state: States, nodePath: string[]): void {
      const walk = (labels: Label[], path: string[]): void => {
        const targetLabelName: string | undefined = path.shift()
        if (targetLabelName !== undefined) {
          const label: Label | undefined = labels.find((el: Label) => {
            return el.name === targetLabelName
          })
          if (label === undefined) {
            labels.push({
              smart: false,
              name: targetLabelName,
              id: uuid(),
              subLabels: [],
            })
            walk(labels[labels.length - 1].subLabels, path)
          } else {
            walk(label.subLabels, path)
          }
        }
      }
      walk(state.labels, nodePath.slice())
    },
  } as Mutations,
  getters: {
    getLabelNodeFromArrayPath: (state: States) => (nodePath: string[]): Label | undefined => {
      if (state.labels.length === 0) {
        return undefined
      }
      const walk = (labels: Label[], path: string[]): Label | undefined => {
        const targetLabelName: string | undefined = path.shift()
        if (targetLabelName === undefined) {
          return undefined
        }
        for (const label of labels) {
          if (label.name === targetLabelName && path.length === 0) {
            return label
          } else if (label.name === targetLabelName) {
            return walk(label.subLabels, path)
          }
        }
        return undefined
      }
      return walk(state.labels, nodePath.slice())
    },
  } as Getters,
  actions: {
  } as Actions,
}
