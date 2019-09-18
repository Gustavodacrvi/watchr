import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

const MINIMUM_DESKTOP_SCREEN_WIDTH = 1020

export default new Vuex.Store({
  state: {
    popup: {
      comp: 'asdfasdf',
      payload: null,
    },
  },
  getters: {
    isDesktop() {
      return document.body.clientWidth >= MINIMUM_DESKTOP_SCREEN_WIDTH
    },
    platform(s, getters) {
      if (getters.isDesktop) return 'desktop'
      return 'mobile'
    },
  },
  mutations: {
    pushPopup(state, popup) {
      state.popup = popup
    },
    closePopup(state) {
      console.log(3)
      state.popup = {comp: '', payload: null}
    }
  },
  actions: {}
});
