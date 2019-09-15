
/* tslint:disable:max-line-length */

import { State as RootState } from '@/interfaces/store'

export namespace SetState {
  export type timeZone = string
  export type FcmTokens = Array<{date: {seconds: number}, token: string}>
  export type dateFormat = 'D-M-Y' | 'M-D-Y'
  export type timeFormat = '13:00' | '1:00pm'
  export type startOfTheWeek = string
  export type nextWeek = string
}

export interface State {
  timeZone: SetState.timeZone
  fcmTokens: SetState.FcmTokens
  dateFormat: SetState.dateFormat
  timeFormat: SetState.timeFormat
  startOfTheWeek: SetState.startOfTheWeek
  nextWeek: SetState.nextWeek
}

export interface ActionContext {
  state: State
  getters: {}
  commit: (mutation: string, payload?: any) => void
  dispatch: (action: string, payload?: any) => void
  rootState: RootState
}

export namespace SetActions {
  export type StoreGetData = (context: ActionContext) => void
  export type GetData = () => void

  export type StoreSaveSettings = (context: ActionContext, obj: {
    timeZone: string,
    dateFormat: string,
    timeFormat: string,
    startOfTheWeek: string,
    nextWeek: string,
  }) => void
  export type SaveSettings = (obj: {
    timeZone: string,
    dateFormat: string,
    timeFormat: string,
    startOfTheWeek: string,
    nextWeek: string,
  }) => void

  export type StoreSetDefaultSettings = (context: ActionContext) => void
  export type SetDefaultSettings = () => void

  export type StoreAddDefaultSettings = (context: ActionContext, id: string) => void
  export type AddDefaultSettings = (id: string) => void

  export type StoreSaveFcmToken = (context: ActionContext, token: string) => void
  export type SaveFcmToken = (token: string) => void
}
