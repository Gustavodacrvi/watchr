
import { Label } from '../app'
import { State as RootState } from '@/interfaces/store/index'

export namespace LabelState {
  export type labels = Label[]
  export type order = string[]
}

/* tslint:disable:max-line-length */

export interface State {
  labels: LabelState.labels
  order: LabelState.order
}

export namespace LabelGetters {
  export type SortedLabels = Label[]
  export type SortedLabelsByName = Label[]
  export type GetLabelsByIds = (ids: string[]) => Label[]
}

interface ActionContext {
  state: State
  getters: Getters
  commit: (mutation: string, payload?: any) => void
  dispatch: (action: string, payload?: any) => void
  rootState: RootState
}

export interface Getters {
  sortedLabels: (state: State) => LabelGetters.SortedLabels
  sortedLabelsByName: (state: State) => LabelGetters.SortedLabelsByName
  getLabelsByIds: (state: State) => LabelGetters.GetLabelsByIds
  [key: string]: (state: State, getters: Getters) => void
}

export namespace LabelActions {
  export type GetData = () => void
  export type StoreGetData = (context: ActionContext) => void

  export type AddLabel = (name: string) => void
  export type StoreAddLabel = (context: ActionContext, name: string) => void

  export type StoreSortLabelsByName = (context: ActionContext) => void
  export type SortLabelsByName = () => void

  export type StoreSaveLabelPosition = (context: ActionContext, ids: string[]) => void
  export type SaveLabelPosition = (ids: string[]) => void

  export type StoreDeleteLabelsById = (context: ActionContext, ids: string[]) => void
  export type DeleteLabelsById = (ids: string[]) => void

  export type StoreEditLabelNameById = (context: ActionContext, obj: {id: string, name: string}) => void
  export type EditLabelNameById = (obj: {id: string, name: string}) => void

  export type StoreSaveLabelTaskOrder = (context: ActionContext, obj: {id: string, order: string[]}) => void
  export type SaveLabelTaskOrder = (obj: {id: string, order: string[]}) => void

  export type StoreAddLabelsOrder = (context: ActionContext, id: string) => void
  export type AddLabelsOrder = (id: string) => Promise<any>
}
