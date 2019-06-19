
import { Label } from '@/interfaces/app'

interface States {
  labels: Label[] | undefined
}

interface Mutations {
  [key: string]: (state: States, payload: any) => any
}

interface Getters {
  getLabelNodeFromArrayPath: () => Label | undefined
  [key: string]: (state: States, getters: any, rootState: States, rootGetters: any) => any
}

export default {
  namespaced: true,
  state: {
    labels: undefined,
  } as States,
  mutations: {

  } as Mutations,
  getters: {
    getLabelNodeFromArrayPath(state: States, nodePath: string[]): Label | undefined {
      if (state.labels === undefined) {
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
      return walk(state.labels, nodePath)
    },
  } as Getters,
}
