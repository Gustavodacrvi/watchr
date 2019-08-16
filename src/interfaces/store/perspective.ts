
/* tslint:disable:max-line-length */

import { Perspective, Task } from '../app'
import { State as RootState } from '@/interfaces/store'

export namespace PersState {
  export type perspectives = Perspective[]
  export type smartOrder = string[]
  export type customOrder = string[]
}

export interface State {
  perspectives: Perspective[]
  smartOrder: string[]
  customOrder: string[]
}

export namespace PersGetters {
  export type SortedSmartPerspectives = Perspective[]
  export type SmartFilters = Perspective[]
  export type SortedCustomPerspectives = Perspective[]
  export type GetPerspectiveByName = (name: string) => Perspective
  export type PinedSmartPerspectives = Perspective[]
  export type PinedCustomPerspectives = Perspective[]
  export type InitialPerspective = Perspective
  export type GetPerspectiveById = (id: string) => Perspective
  export type GetNumberOfTasksByPerspectiveId = (id: string, tasks: Task[]) => number
}

export  interface Getters {
  sortedSmartPerspectives: (state: State, getters: Getters) => PersGetters.SortedSmartPerspectives
  smartFilters: (state: State, getters: Getters) => PersGetters.SmartFilters
  sortedCustomPerspectives: (state: State, getters: Getters) => PersGetters.SortedCustomPerspectives
  getPerspectiveByName: (state: State, getters: Getters) => PersGetters.GetPerspectiveByName
  pinedSmartPerspectives: (state: State, getters: Getters) => PersGetters.PinedSmartPerspectives
  pinedCustomPerspectives: (state: State, getters: Getters) => PersGetters.PinedCustomPerspectives
  initialPerspective: (state: State, getters: Getters) => PersGetters.InitialPerspective
  getPerspectiveById: (state: State, getters: Getters) => PersGetters.GetPerspectiveById
  getNumberOfTasksByPerspectiveId: (state: State, getters: Getters, rootState: RootState) => PersGetters.GetNumberOfTasksByPerspectiveId
  [key: string]: (...arr: any[]) => any
}

interface ActionContext {
  state: State
  getters: Getters
  commit: (mutation: string, payload?: any) => void
  dispatch: (action: string, payload?: any) => void
  rootState: RootState
}

export namespace PersActions {
  export type StoreDeletePerspectivesById = (context: ActionContext, ids: string[]) => void
  export type DeletePerspectivesById = (ids: string[]) => void

  export type StoreGetData = (context: ActionContext) => void
  export type GetData = () => void

  export type StoreAddDefaultPerspectives = (context: ActionContext, obj: {id: string, someday: string, anytime: string}) => void
  export type AddDefaultPerspectives = (obj: {id: string, someday: string, anytime: string}) => void

  export type StoreSaveSmartOrder = (context: ActionContext, ids: string[]) => void
  export type SaveSmartOrder = (ids: string[]) => void

  export type StoreSaveCustomOrder = (context: ActionContext, ids: string[]) => void
  export type SaveCustomOrder = (ids: string[]) => void

  export type StoreAddSmartPersFilter = (context: ActionContext, obj: {id: string, persName: string}) => void
  export type AddSmartPersFilter = (obj: {id: string, persName: string}) => void

  export type StoreRemoveSmartPersFilter = (context: ActionContext, obj: {id: string, persName: string}) => void
  export type RemoveSmartPersFilter = (obj: {id: string, persName: string}) => void

  export type StoreTogglePerspectivesPin = (context: ActionContext, arr: Array<{id: string, pin?: boolean}>) => void
  export type TogglePerspectivesPin = (arr: Array<{id: string, pin?: boolean}>) => void

  export type StoreTogglePerspectivesNumberOfTasks = (context: ActionContext, arr: Array<{id: string, show?: boolean}>) => void
  export type TogglePerspectivesNumberOfTasks = (arr: Array<{id: string, show?: boolean}>) => void

  export type StoreTogglePerspectivesShowWhenNotEmpty = (context: ActionContext, arr: Array<{id: string, show?: boolean}>) => void
  export type TogglePerspectivesShowWhenNotEmpty = (arr: Array<{id: string, show?: boolean}>) => void

  export type StoreSaveTaskOrder = (context: ActionContext, obj: {id: string, order: string[]}) => void
  export type SaveTaskOrder = (obj: {id: string, order: string[]}) => void

  export type StoreAddLabelToPerspective = (context: ActionContext, obj: {id: string, labelId: string}) => void
  export type AddLabelToPerspective = (obj: {id: string, labelId: string}) => void

  export type StoreRemoveLabelFromPerspective = (context: ActionContext, obj: {id: string, labelId: string}) => void
  export type RemoveLabelFromPerspective = (obj: {id: string, labelId: string}) => void

  export type StoreSavePerspectivePriority = (context: ActionContext, obj: {id: string, priority: string}) => void
  export type SavePerspectivePriority = (obj: {id: string, priority: string}) => void

  export type StoreAddPerspectiveSort = (context: ActionContext, obj: {sort: string, perspectiveId: string}) => void
  export type AddPerspectiveSort = (obj: {sort: string, perspectiveId: string}) => void

  export type StoreSavePerspectiveTaskSort = (context: ActionContext, obj: {sort: string[], perspectiveId: string}) => void
  export type SavePerspectiveTaskSort = (obj: {sort: string[], perspectiveId: string}) => void

  export type StoreAddPerspective = (context: ActionContext, obj: Perspective) => void
  export type AddPerspective = (obj: Perspective) => void

  export type StoreEditPerspective = (context: ActionContext, obj: Perspective & {id: string}) => void
  export type EditPerspective = (obj: Perspective & {id: string}) => void

  export type StoreSaveSmartPerspective = (context: ActionContext, obj: {
    alwaysShowTaskLabels: boolean,
    alwaysShowLastEditDate: boolean,
    alwaysShowCreationDate: boolean,
    id: string,
  }) => void
  export type SaveSmartPerspective = (obj: {
    alwaysShowTaskLabels: boolean,
    alwaysShowLastEditDate: boolean,
    alwaysShowCreationDate: boolean,
    id: string,
  }) => void
}
