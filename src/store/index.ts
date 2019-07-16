import Vue from 'vue'
import Vuex from 'vuex'
import router from './../router'

import label from '@/store/label'
import perspective from '@/store/perspective'
import task from '@/store/task'
import settings from '@/store/settings'

const MAX_MOBILE_SCREEN_WIDTH = 992

import { SimpleAdder, Alert, Perspective, ListIcon } from '@/interfaces/app'

Vue.use(Vuex)

const savedTheme: string = localStorage.getItem('watchrTheme') || 'light'

export interface States {
  theme: string
  popUpComponent: string
  windowWidth: number
  popUpPayload: any | SimpleAdder
  appBarState: boolean
  firestore: firebase.firestore.Firestore | null
  isLogged: boolean
  viewName: string
  viewType: string
  uid: string | null
  firebase: any
  isAnonymous: boolean
  appBarSection: string
  navBarTitle: string
  navBarOptions: ListIcon[]
  emailVerified: boolean
  appError: boolean
  loading: boolean
  showingAlert: boolean
  alerts: Alert[]
  alert: Alert | undefined
}

interface Mutations {
  pushTheme: (state: States, theme: string) => void
  pushPopUp: (state: States, compName: string) => void
  pushAlert: (state: States, alert: Alert) => void
  pushPopUpPayload: (state: States, payload: any) => void
  saveCurrentUser: (state: States, user: firebase.User) => void
  saveFirestore: (state: States, firestore: firebase.firestore.Firestore) => void
  saveFirebase: (state: States, firebase: any) => void
  pushAppView: (state: States, comp: string) => void
  pushPerspective: (state: States, payload?: any) => void
  pushView: (state: States, obj: {view: string, viewType: string}) => void
  addNavBarTitle: (state: States, title: string) => void
  sendOptionsToNavbar: (state: States, options: ListIcon[]) => void
  pushAppBarSection: (state: States, section: string) => void
  showApp: () => void
  hideNavBarOptions: () => void
  openAppBar: () => void
  closeAppBar: () => void
  resetPopUpState: () => void
  hideAlert: () => void
  [key: string]: (state: States, payload: any) => any
}

interface Getters {
  isDesktop: () => boolean
  isStandAlone: () => boolean
  platform: () => 'mobile' | 'desktop'
  isOnAppRoute: () => boolean
  perspectiveData: () => Perspective
  loggedAndVerified: () => boolean
  loggedAndNotVerified: () => boolean
  anonymous: () => boolean
  [key: string]: (state: States, getters: any, rootState: States, rootGetters: any) => any
}

interface ActionContext {
  state: States
  getters: Getters
  commit: (mutation: string, payload?: any) => void
  dispatch: (action: string) => void
}

interface Actions {
  getWindowWidthOnResize: (context: ActionContext) => void
  showLastAlert: (context: ActionContext) => void
  activateKeyShortcut: (context: ActionContext, key: string) => void
  [key: string]: (context: ActionContext, payload: any) => any
}

const store: any = new Vuex.Store({
  modules: {
    label, perspective, task, settings,
  } as any,
  state: {
    theme: savedTheme,
    popUpComponent: '',
    popUpPayload: null,
    navBarTitle: '',
    windowWidth: document.body.clientWidth,
    appBarState: false,
    isLogged: false,
    firestore: null,
    viewName: '',
    viewType: '',
    isAnonymous: false,
    emailVerified: false,
    loading: true,
    firebase: null,
    navBarOptions: [],
    appError: false,
    uid: null,
    appBarSection: '',
    showingAlert: false,
    alerts: [],
    alert: undefined,
  } as States,
  mutations: {
    pushAppBarSection(state: States, section: string) {
      state.appBarSection = section
    },
    saveFirestore(state: States, firestore: firebase.firestore.Firestore) {
      state.firestore = firestore
      state.firestore.enablePersistence()
        .catch(err => {
          if (err.code === 'failed-precondition')
            state.appError = true
          else if (err.code === 'unimplemented')
            state.alerts.push({
              // tslint:disable-next-line:max-line-length
              name: `Firestore's persistence is not available on your browser, therefore you won't be able to use this app offline.</br>Please chose a better browser or update the current one to the latest version.`,
              duration: 12,
              type: 'error',
            })
        })
    },
    saveFirebase(state: States, firebase) {
      state.firebase = firebase
    },
    pushTheme(state: States, theme: string) {
      state.theme = theme
      localStorage.setItem('watchrTheme', theme)
    },
    saveCurrentUser(state: States, user: firebase.User | null) {
      if (user !== null) {
        state.isLogged = true
        state.isAnonymous = user.isAnonymous
        state.emailVerified = user.emailVerified
        state.uid = user.uid
      } else {
        state.isLogged = false
        state.isAnonymous = false
        state .emailVerified = false
        state.uid = null
      }
    },
    resetPopUpState(state: States) {
      state.popUpComponent = ''
      state.popUpPayload = null
    },
    pushPopUp(state: States, compName: string) {
      const isDesktop = state.windowWidth > MAX_MOBILE_SCREEN_WIDTH
      if (!isDesktop && compName === '' && state.popUpComponent !== '')
        router.go(-1)
      if (!isDesktop && compName !== '' && state.popUpComponent === '')
        router.push({ name: 'Popup' })
      state.popUpComponent = compName
      state.popUpPayload = null
    },
    pushPopUpPayload(state: States, payload: any | SimpleAdder) {
      state.popUpPayload = payload
    },
    showApp(state: States) {
      state.loading = false
    },
    pushAlert(state: States, alert: Alert) {
      state.alerts.push(alert)
    },
    hideAlert(state: States) {
      state.showingAlert = false
    },
    openAppBar(state: States) {
      state.appBarState = true
    },
    closeAppBar(state: States) {
      state.appBarState = false
    },
    pushView(state: States, {view, viewType}) {
      state.viewName = view
      state.viewType = viewType
    },
    addNavBarTitle(state: States, title: string) {
      state.navBarTitle = title
    },
    sendOptionsToNavbar(state: States, options: ListIcon[]) {
      state.navBarOptions = options
    },
    hideNavBarOptions(state: States) {
      state.navBarOptions = []
    },
  } as Mutations,
  getters: {
    isDesktop(state: States): boolean {
      if (state.windowWidth > MAX_MOBILE_SCREEN_WIDTH)
        return true
      return false
    },
    platform(state: States, getters: Getters): 'desktop' | 'mobile' {
      if (getters.isDesktop)
        return 'desktop'
      return 'mobile'
    },
    isStandAlone(state: States): boolean {
      const navigator: any = window.navigator
      return (navigator.standalone === true)
      || (window.matchMedia('(display-mode: standalone)').matches)
    },
    loggedAndVerified(state: States) {
      return state.isLogged && state.emailVerified
    },
    loggedAndNotVerified(state: States) {
      return state.isLogged && !state.emailVerified
    },
    anonymous(state: States) {
      return state.isLogged && state.isAnonymous
    },
    perspectiveData(state: States) {
      const s = state as any
      return s.perspective.customPerspectives.find((el: Perspective) => el.name === state.viewName)
    },
  } as Getters,
  actions: {
    getWindowWidthOnResize({state, getters, commit}) {
      window.addEventListener('resize', () => {
        state.windowWidth = document.body.clientWidth
        if (!getters.isDesktop)
          commit('closeAppBar')
      })
    },
    showLastAlert({state, commit}) {
      const NUMBER_OF_MILISECONDS_IN_ONE_SECOND = 1000
      if (state.alerts.length !== 0 && !state.showingAlert) {
        state.alert = state.alerts.shift() as Alert
        state.showingAlert = true
        if (state.alert.duration)
          setTimeout(() => {
            state.showingAlert = false
          }, state.alert.duration * NUMBER_OF_MILISECONDS_IN_ONE_SECOND)
      }
    },
    activateKeyShortcut({state, commit, getters}, key) {
      if ((getters.loggedAndVerified || getters.anonymous) && getters.isDesktop)
        switch (key) {
          case 'l': commit('pushPopUp', 'LabeladderPopup'); break
          case 'p': commit('pushPopUp', 'PerspectiveAdderPopup'); break
          case 'h': commit('pushPopUp', ''); break
        }
    },
  } as Actions,
})

store.dispatch('getWindowWidthOnResize')

export default store
