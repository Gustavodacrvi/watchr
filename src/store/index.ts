import Vue from 'vue'
import Vuex, { Action } from 'vuex'

import app from './app'

Vue.use(Vuex)

const savedTheme: string = localStorage.getItem('watchrTheme') || 'light'

interface States {
  theme: string
  popUpComponent: string
  windowWidth: number
  appBarState: boolean
  isLogged: boolean
}

interface Mutations {
  pushTheme: (state: States, theme: string) => void
  pushPopUp: (state: States, compName: string) => void
  openAppBar: () => void
  closeAppBar: () => void
  [key: string]: (state: States, payload: any) => any
}

interface Getters {
  isDesktop: () => boolean
  isStandAlone: () => boolean
  platform: () => 'mobile' | 'desktop'
  [key: string]: (state: States, getters: any, rootState: States, rootGetters: any) => any
}

interface Actions {
  getWindowWidthOnResize: (obj: {state: States}) => void
  [key: string]: (obj: any) => any
}

const store: any = new Vuex.Store({
  modules: {
    app,
  },
  state: {
    theme: savedTheme,
    popUpComponent: '',
    windowWidth: document.body.clientWidth,
    appBarState: false,
    isLogged: false,
  } as States,
  mutations: {
    pushTheme(state: States, theme: string): void {
      state.theme = theme
      localStorage.setItem('watchrTheme', theme)
    },
    pushPopUp(state: States, compName: string): void {
      state.popUpComponent = compName
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
    getWindowWidthOnResize({state, getters, commit}:
       {state: States, getters: Getters, commit: (str: string) => void}): void {
      window.addEventListener('resize', () => {
        state.windowWidth = document.body.clientWidth
        if (!getters.isDesktop) {
          commit('closeAppBar')
        } else {
          commit('openAppBar')
        }
      })
    },
  } as Actions,
})

store.dispatch('getWindowWidthOnResize')

export default store
