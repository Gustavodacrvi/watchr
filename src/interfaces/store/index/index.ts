
import { SimpleAdder, ListIcon, Alert, CenteredCard, Perspective } from '../../app'

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

export namespace IndexMutations {
  export type HideExtraActions = (state: State) => void
  export type ShowExtraActions = (state: State) => void
  export type ShowApp = (state: State) => void
  export type HideNavBarOptions = (state: State) => void
  export type OpenAppBar = (state: State) => void
  export type CloseAppBar = (state: State) => void
  export type ResetPopUpState = (state: State) => void
  export type HideAlert = (state: State) => void
  export type PushAlert = (state: State, alert: Alert) => void
  export type PushTheme = (state: State, theme: string) => void
  export type PopUp = (state: State, compName: string) => void
  export type PushPopUpPayload = (state: State, payload: any) => void
  export type SaveCurrentUser = (state: State, user: firebase.User) => void
  export type SaveFirestore = (state: State, firestore: firebase.firestore.Firestore) => void
  export type PushCenteredCard = (state: State, centeredCardPopUp: CenteredCard | null) => void
  export type OpenSection = (state: State, currentAppSection: string) => void
  export type SaveFirebase = (state: State, firebase: any) => void
  export type PushAppView = (state: State, comp: string) => void
  export type PushPerspective = (state: State, payload?: any) => void
  export type PushView = (state: State, obj: {view: string, viewType: string}) => void
  export type AddNavBarTitle = (state: State, title: string) => void
  export type SendOptionsToNavbar = (state: State, options: ListIcon[]) => void
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
  export type GetWindowWidthOnResize = (par: any) => void
  export type ShowLastAlert = (par: any) => void
  export type activateKeyShortcut = (par: any, key: string) => void
}
