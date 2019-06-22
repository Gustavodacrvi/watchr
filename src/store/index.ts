import Vue from 'vue'
import Vuex, { Action } from 'vuex'
import router from '@/router'

import perspective from './perspective'
import label from './label'

import { Alert } from '@/interfaces/alert'

Vue.use(Vuex)

const savedTheme: string = localStorage.getItem('watchrTheme') || 'light'

interface States {
  theme: string
  popUpComponent: string
  windowWidth: number
  popUpPayload: any
  appBarState: boolean
  isLogged: boolean
  showingAlert: boolean
  alerts: Alert[]
  alert: Alert | undefined
}

interface Mutations {
  pushTheme: (state: States, theme: string) => void
  pushPopUp: (state: States, compName: string) => void
  pushAlert: (state: States, alert: Alert) => void
  pushPopUpPayload: (state: States, payload: any) => void
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
    perspective, label,
  } as any,
  state: {
    theme: savedTheme,
    popUpComponent: '',
    popUpPayload: null,
    windowWidth: document.body.clientWidth,
    appBarState: false,
    isLogged: false,
    showingAlert: false,
    alerts: [],
    alert: undefined,
  } as States,
  mutations: {
    pushTheme(state: States, theme: string): void {
      state.theme = theme
      localStorage.setItem('watchrTheme', theme)
    },
    pushPopUp(state: States, compName: string): void {
      state.popUpComponent = compName
      state.popUpPayload = null
    },
    pushPopUpPayload(state: States, payload: any): void {
      state.popUpPayload = payload
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
      if (state.windowWidth > 1024) {
        return true
      }
      return false
    },
    platform(state: States, getters: Getters): 'desktop' | 'mobile' {
      if (getters.isDesktop) {
        return 'desktop'
      }
      return 'mobile'
    },
    isStandAlone(state: States): boolean {
      return window.matchMedia('(display-mode: standalone)').matches
    },
  } as Getters,
  actions: {
    getWindowWidthOnResize({state, getters, commit}): void {
      window.addEventListener('resize', () => {
        state.windowWidth = document.body.clientWidth
        if (!getters.isDesktop) {
          commit('closeAppBar')
        } else {
          commit('openAppBar')
        }
      })
    },
    showLastAlert({state, commit}): void {
      if (state.alerts.length !== 0 && !state.showingAlert) {
        state.alert = state.alerts.shift() as Alert
        state.showingAlert = true
        setTimeout(() => {
          state.showingAlert = false
        }, state.alert.duration * 1000)
      }
    },
    activateKeyShortcut({state, commit}, key): void {
      switch (key) {
        case 'l': commit('pushPopUp', 'LabeladderPopup'); break
        case 'h': commit('pushPopUp', ''); break
      }
    },
  } as Actions,
})

store.dispatch('getWindowWidthOnResize')

export default store
