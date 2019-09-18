import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

const MINIMUM_DESKTOP_SCREEN_WIDTH = 1020

export default new Vuex.Store({
  state: {
    popup: {
      comp: 'Signup',
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
    isPopupOpened(state) {
      return state.popup.comp !== ''
    }
  },
  mutations: {
    closePopup(state) {
      state.popup = {comp: '', payload: null}
    }
  },
  actions: {
    pushPopup({state, getters}, popup) {
      state.popup = popup
    },
  }
});
