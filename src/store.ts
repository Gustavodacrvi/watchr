import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const savedTheme: string = localStorage.getItem('watchrTheme') || 'light'

interface State {
  theme: string
  popUpComponent: string
}

export default new Vuex.Store({
  state: {
    theme: savedTheme,
    popUpComponent: '',
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

  },
  actions: {

  },
})
