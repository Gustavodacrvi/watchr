import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const savedTheme: string = localStorage.getItem('watchrTheme') || 'light'

interface State {
  theme: string
  popUpComponent: string
  windowWidth: number
  appBarState: boolean
  isLogged: boolean
}

const store: any = new Vuex.Store({
  state: {
    theme: savedTheme,
    popUpComponent: '',
    windowWidth: document.body.clientWidth,
    appBarState: false,
    isLogged: false,
  } as State,
  mutations: {
    pushTheme(state: State, theme: string): void {
      state.theme = theme
      localStorage.setItem('watchrTheme', theme)
    },
    pushPopUp(state: State, compName: string): void {
      state.popUpComponent = compName
    },
    openAppBar(state: State): void {
      state.appBarState = true
    },
    closeAppBar(state: State): void {
      state.appBarState = false
    },
  },
  getters: {
    isDesktop(state: State): boolean {
      if (state.windowWidth > 1024) {
        return true
      }
      return false
    },
  },
  actions: {
    getWindowWidthOnResize({state}: {state: State}): void {
      window.addEventListener('resize', () => {
        state.windowWidth = document.body.clientWidth
      })
    },
  },
})

store.dispatch('getWindowWidthOnResize')

export default store
