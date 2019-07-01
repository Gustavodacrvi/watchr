import Vue from 'vue'
import Vuex from 'vuex'

import label from '@/store/label'

const MAX_MOBILE_SCREEN_WIDTH = 1024

import { SimpleAdder, Alert } from '@/interfaces/app'

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
  isAnonymous: boolean
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
  showApp: () => void
  openAppBar: () => void
  closeAppBar: () => void
  hideAlert: () => void
  [key: string]: (state: States, payload: any) => any
}

interface Getters {
  isDesktop: () => boolean
  isStandAlone: () => boolean
  platform: () => 'mobile' | 'desktop'
  isOnAppRoute: () => boolean
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
    label,
  } as any,
  state: {
    theme: savedTheme,
    popUpComponent: '',
    popUpPayload: null,
    windowWidth: document.body.clientWidth,
    appBarState: false,
    isLogged: false,
    firestore: null,
    isAnonymous: false,
    emailVerified: false,
    loading: true,
    appError: false,
    showingAlert: false,
    alerts: [],
    alert: undefined,
  } as States,
  mutations: {
    saveFirestore(state: States, firestore: firebase.firestore.Firestore) {
      state.firestore = firestore
      state.firestore.enablePersistence()
        .catch(err => {
          if (err.code === 'failed-precondition')
            state.appError = true
          else if (err.code === 'unimplemented')
            state.alerts.push({
              name: `Firestore's persistence is not available on your browser, therefore you won't be able to use this app offline.</br>Please chose a better browser or update the current one to the latest version.`,
              duration: 12,
              type: 'error',
            })
        })
    },
    pushTheme(state: States, theme: string): void {
      state.theme = theme
      localStorage.setItem('watchrTheme', theme)
    },
    saveCurrentUser(state: States, user: firebase.User | null) {
      if (user !== null) {
        state.isLogged = true
        state.isAnonymous = user.isAnonymous
        state.emailVerified = user.emailVerified
      } else {
        state.isLogged = false
        state.isAnonymous = false
        state .emailVerified = false
      }
    },
    pushPopUp(state: States, compName: string): void {
      state.popUpComponent = compName
      state.popUpPayload = null
    },
    pushPopUpPayload(state: States, payload: any | SimpleAdder): void {
      state.popUpPayload = payload
    },
    showApp(state: States) {
      state.loading = false
    },
    pushAlert(state: States, alert: Alert): void {
      state.alerts.push(alert)
    },
    hideAlert(state: States): void {
      state.showingAlert = false
    },
    openAppBar(state: States): void {
      state.appBarState = true
    },
    closeAppBar(state: States): void {
      state.appBarState = false
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
          case 'h': commit('pushPopUp', ''); break
        }
    },
  } as Actions,
})

store.dispatch('getWindowWidthOnResize')

export default store
