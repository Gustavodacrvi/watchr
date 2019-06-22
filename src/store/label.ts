
import { Label } from '@/interfaces/app'

import uuid from 'uuid'
import label from '@/utils/label';

interface States {
  labels: Label[]
}

interface Mutations {
  save: () => void
  getSavedData: () => void
  [key: string]: (state: States, payload: any) => any
}

interface Getters {
  getLabelNodeFromArrayPath: () => (nodePath: string[]) => Label | undefined
  labelPathById: () => (id: string) => string[] | undefined
  getLabelNodeById: () => (id: string) => Label
  getParentLabelById: () => (id: string) => Label | undefined
  smartLabels: () => Label[]
  nonSmartLabels: () => Label[]
  [key: string]: (state: States, getters: any, rootState: States, rootGetters: any) => any
}

interface ActionContext {
  state: States
  getters: Getters
  commit: (mutation: string, payload?: any) => void
  dispatch: (action: string) => void
}


interface Actions {
  addLabelFromArrayPath: (context: ActionContext, path: string[]) => void
  deleteLabelById: (context: ActionContext, id: string) => void
  addSubLabelById: (context: ActionContext, {parentId, subLabelName, position}: {parentId: string, subLabelName: string, position: number | undefined}) => void
  addRootLabel: (context: ActionContext, {labelName, position}: {labelName: string, position: number | undefined}) => void
  [key: string]: (context: ActionContext, payload: any) => any
}

export default {
  namespaced: true,
  state: {
    labels: [],
  } as States,
  mutations: {
    save(state: States): void {
      if (!localStorage.getItem('watchrIsLogged')) {
        localStorage.setItem('watchrLabels', JSON.stringify(state.labels))
      }
    },
    getSavedData(state: States): void {
      if (!localStorage.getItem('watchrIsLogged')) {
        state.labels = JSON.parse(localStorage.getItem('watchrLabels') as any)
      }
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
    getParentLabelById: (state: States) => (id: string): Label | undefined => {
      const rootLabel: Label | undefined = state.labels.find((el: Label) => el.id === id)
      if (rootLabel !== undefined) {
        return undefined
      }
      const walk = (labels: Label[], parent: Label): Label | undefined => {
        for (const lab of labels) {
          if (lab.id === id) {
            return parent
          }
          const node: Label | undefined = walk(lab.subLabels, lab)
          if (node !== undefined) {
            return node
          }
        }
        return undefined
      }
      for (const lab of state.labels) {
        const node: Label | undefined = walk(lab.subLabels, lab)
        if (node !== undefined) {
          return node
        }
      }
      return undefined
    },
    getLabelNodeById: (state: States) => (id: string): Label | undefined => {
      const walk = (labels: Label[]): Label | undefined => {
        for (const lab of labels) {
          if (lab.id === id) {
            return lab
          }
          const label: Label | undefined = walk(lab.subLabels)
          if (label !== undefined) {
            return label
          }
        }
        return undefined
      }
      return walk(state.labels)
    },
    labelPathById: (state: States) => (id: string): string[] | undefined => {
      const walk = (labels: Label[], path: string[]): string[] | undefined => {
        for (const lab of labels) {
          if (lab.id === id) {
            path.push(lab.name)
            return path
          }
          const sliced = path.slice()
          sliced.push(lab.name)
          const childPath: string[] | undefined = walk(lab.subLabels, sliced)
          if (childPath !== undefined) {
            return childPath
          }
        }
        return undefined
      }
      return walk(state.labels, [])
    },
    smartLabels(state: States): Label[] {
      return state.labels.filter((el: Label) => el.smart)
    },
    nonSmartLabels(state: States): Label[] {
      return state.labels.filter((el: Label) => !el.smart)
    },
  } as Getters,
  actions: {
    setDefaultData({state, commit}): void {
      state.labels = [
        {name: 'Someday', id: uuid(), smart: true, subLabels: []},
        {name: 'Anytime', id: uuid(), smart: true, subLabels: []},
      ]
      commit('save')
    },
    updateLabels({state, commit}, labels: Label[]): void {
      state.labels = labels
      commit('save')
    },
    addLabelFromArrayPath({state, commit}, nodePath: string[]): void {
      const walk = (labels: Label[], path: string[]): void => {
        const targetLabelName: string | undefined = path.shift()
        if (targetLabelName !== undefined) {
          const label: Label | undefined = labels.find((el: Label) => {
            return el.name === targetLabelName
          })
          if (label === undefined) {
            if (targetLabelName !== '') {
              labels.push({
                smart: false,
                name: targetLabelName,
                id: uuid(),
                subLabels: [],
              })
              walk(labels[labels.length - 1].subLabels, path)
            }
          } else {
            walk(label.subLabels, path)
          }
        }
      }
      walk(state.labels, nodePath.slice())
      commit('save')
    },
    deleteLabelById({state, commit}, id: string): void {
      const walk = (labels: Label[]): boolean => {
        let i = 0
        for (const lab of labels) {
          if (lab.id === id) {
            labels.splice(i, 1)
            return true
          }
          const found: boolean = walk(lab.subLabels)
          if (found) {
            return true
          }
          i++
        }
        return false
      }
      walk(state.labels)
      commit('save')
    },
    addSubLabelById({state, commit, getters}, {subLabelName, parentId, position}): void {
      const getLabelNodeById = <any>getters.getLabelNodeById
      const parentLabel: Label = getLabelNodeById(parentId)
      const label: Label = {
        smart: false,
        name: subLabelName,
        id: uuid(),
        subLabels: [],
      }
      if (position === undefined) {
        parentLabel.subLabels.push(label)
      } else {
        parentLabel.subLabels.splice(position, 0, label)
      }
      commit('save')
    },
    addRootLabel({state, commit}, {labelName, position}): void {
      const label: Label | undefined = state.labels.find((el: Label) => el.name === labelName)
      if (label === undefined) {
        const label: Label = {
          smart: false,
          name: labelName,
          id: uuid(),
          subLabels: [],
        }
        if (position === undefined) {
          state.labels.push(label)
        } else {
          state.labels.splice(position, 0, label)
        }
        commit('save')
      }
    }
  } as Actions,
}
