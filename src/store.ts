import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const savedTheme: string = localStorage.getItem('watchrTheme') || 'light'

export default new Vuex.Store({
  state: {
    theme: savedTheme,
    popUpComponent: '',
  },
  mutations: {
    pushTheme(state: any, theme: string): void {
      state.theme = theme
      localStorage.setItem('watchrTheme', theme)
    },
  },
  getters: {

  },
  actions: {

  },
})
