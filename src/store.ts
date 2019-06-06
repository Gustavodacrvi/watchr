import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    theme: 'light',
  },
  mutations: {
    pushTheme(state: {theme: string}, theme: string): void {
      state.theme = theme
    },
  },
  getters: {

  },
  actions: {

  },
})
