
/* tslint:disable:max-line-length */

import { SimpleAdder, ListIcon, Alert, CenteredCard, Perspective } from '../app'

export namespace IndexState {
  export type showingExtraActions = boolean
  export type appBarState = boolean
  export type isLogged = boolean
  export type isAnonymous = boolean
  export type emailVerified = boolean
  export type appError = boolean
  export type loading = boolean
  export type showingAlert = boolean
  export type theme = 'light' | 'dark'
  export type uid = string | null
  export type popUpComponent = string
  export type viewName = string
  export type viewType = string
  export type currentAppSection = string
  export type navBarTitle = string
  export type windowWidth = number
  export type popUpPayload = any | SimpleAdder
  export type firestore = firebase.firestore.Firestore | null
  export type centeredCard = CenteredCard | null
  export type firebase = any
  export type navBarOptions = ListIcon[]
  export type alerts = Alert[]
  export type alert = Alert | undefined
}

export interface State {
  theme: IndexState.theme
  popUpComponent: IndexState.popUpComponent
  windowWidth: IndexState.windowWidth
  showingExtraActions: IndexState.showingExtraActions
  popUpPayload: IndexState.popUpPayload
  appBarState: IndexState.appBarState
  firestore: IndexState.firestore
  isLogged: IndexState.isLogged
  viewName: IndexState.viewName
  centeredCard: IndexState.centeredCard
  viewType: IndexState.viewType
  currentAppSection: IndexState.currentAppSection
  uid: IndexState.uid
  firebase: IndexState.firebase
  isAnonymous: IndexState.isAnonymous
  navBarTitle: IndexState.navBarTitle
  navBarOptions: IndexState.navBarOptions
  emailVerified: IndexState.emailVerified
  appError: IndexState.appError
  loading: IndexState.loading
  showingAlert: IndexState.showingAlert
  alerts: IndexState.alerts
  alert: IndexState.alert
}

type OverloadVoid = (state?: State) => void

export namespace IndexMutations {
  export type HideExtraActions = OverloadVoid
  export type ShowExtraActions = OverloadVoid
  export type ShowApp = OverloadVoid
  export type HideNavBarOptions = OverloadVoid
  export type OpenAppBar = OverloadVoid
  export type CloseAppBar = OverloadVoid
  export type ResetPopUpState = OverloadVoid
  export type HideAlert = OverloadVoid
  export type PushAlert = {
    (alert: Alert): void,
    (state: State, alert: Alert): void,
  }
  export type PushTheme = {
    (theme: string): void,
    (state: State, theme: string): void,
  }
  export type PushPopUp = {
    (compName: string): void,
    (state: State, compName: string): void,
  }
  export type PushPopUpPayload = {
    (payload: any): void,
    (state: State, payload: any): void,
  }
  export type SaveCurrentUser = {
    (user: firebase.User): void,
    (state: State, user: firebase.User): void,
  }
  export type SaveFirestore = {
    (firestore: firebase.firestore.Firestore): void,
    (state: State, firestore: firebase.firestore.Firestore): void,
  }
  export type PushCenteredCard = {
    (centeredCardPopUp: CenteredCard | null): void,
    (state: State, centeredCardPopUp: CenteredCard | null): void,
  }
  export type OpenSection = {
    (currentAppSection: string): void,
    (state: State, currentAppSection: string): void,
  }
  export type SaveFirebase = {
    (firebase: any): void,
    (state: State, firebase: any): void,
  }
  export type PushAppView = {
    (comp: string): void,
    (state: State, comp: string): void,
  }
  export type PushPerspective = {
    (payload?: any): void,
    (state: State, payload?: any): void,
  }
  export type PushView = {
    (obj: {view: string, viewType: string}): void,
    (state: State, obj: {view: string, viewType: string}): void,
  }
  export type AddNavBarTitle = {
    (title: string): void,
    (state: State, title: string): void,
  }
  export type SendOptionsToNavbar = {
    (options: ListIcon[]): void,
    (state: State, options: ListIcon[]): void,
  }
}

export namespace IndexGetters {
  export type IsDesktop = boolean
  export type IsStandAlone = boolean
  export type IsOnAppRoute = boolean
  export type LoggedAndVerified = boolean
  export type LoggedAndNotVerified = boolean
  export type Anonymous = boolean
  export type Platform = 'mobile' | 'desktop'
  export type PerspectiveData = Perspective
}

export namespace IndexActions {
  export type GetWindowWidthOnResize = () => void
  export type StoreGetWindowWidthOnResize = (par: any) => void
  export type ShowLastAlert = () => void
  export type StoreShowLastAlert = (par: any) => void
  export type ActivateKeyShortcut = (key: string) => void
  export type StoreActivateKeyShortcut = (par: any, key: string) => void
}
