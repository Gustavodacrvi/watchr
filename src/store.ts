import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const savedTheme: string = localStorage.getItem('watchrTheme') || 'light'

interface State {
  theme: string
  popUpComponent: string
  windowWidth: number
}

const store: any = new Vuex.Store({
  state: {
    theme: savedTheme,
    popUpComponent: '',
    windowWidth: 1024,
  } as State,
  mutations: {
    pushTheme(state: State, theme: string): void {
      state.theme = theme
      localStorage.setItem('watchrTheme', theme)
    },
    pushPopUp(state: State, compName: string): void {
      state.popUpComponent = compName
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
      state.windowWidth = document.body.clientWidth
      window.addEventListener('resize', () => {
        state.windowWidth = document.body.clientWidth
      })
    },
  },
})

store.dispatch('getWindowWidthOnResize')

export default store
