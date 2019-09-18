import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

const MINIMUM_DESKTOP_SCREEN_WIDTH = 1020

const store = new Vuex.Store({
  state: {
    popup: {
      comp: '',
      payload: null,
    },
    windowWidth: 0,
  },
  getters: {
    isDesktop(state) {
      return state.windowWidth >= MINIMUM_DESKTOP_SCREEN_WIDTH
    },
    platform(s, getters) {
      if (getters.isDesktop) return 'desktop'
      return 'mobile'
    },
    isPopupOpened(state) {
      return state.popup.comp !== ''
    },
  },
  mutations: {
    closePopup(state) {
      state.popup = {comp: '', payload: null}
    },
    saveWindowWidth(state) {
      state.windowWidth = document.body.clientWidth
    },
  },
  actions: {
    pushPopup({state, getters}, popup) {
      state.popup = popup
    },
  }
});

window.addEventListener('resize', () => store.commit('saveWindowWidth'))

store.commit('saveWindowWidth')

export default store
