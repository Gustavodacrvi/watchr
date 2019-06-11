import Vue from 'vue'
import Vuex from 'vuex'

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
  openAppBar: (state: States) => void
  closeAppBar: (state: States) => void
  [key: string]: (state: States, payload: any) => any
}

interface Getters {
  isDesktop: (state: States) => boolean
  [key: string]: (state: States, getters: any, rootState: States, rootGetters: any) => any
}

const store: any = new Vuex.Store({
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
  } as Getters,
  actions: {
    getWindowWidthOnResize({state}: {state: States}): void {
      window.addEventListener('resize', () => {
        state.windowWidth = document.body.clientWidth
      })
    },
  } as Actions,
})

store.dispatch('getWindowWidthOnResize')

export default store
