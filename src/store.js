import Vue from "vue"
import Vuex from "vuex"
import router from './router'

Vue.use(Vuex)

const MINIMUM_DESKTOP_SCREEN_WIDTH = 1020

import firebase from 'firebase/app'
import 'firebase/auth'

firebase.initializeApp({
  apiKey: process.env.VUE_APP_API_KEY,
  authDomain: process.env.VUE_APP_AUTH_DOMAIN,
  databaseURL: process.env.VUE_APP_DATABASE_URL,
  projectId: process.env.VUE_APP_PROJECT_ID,
  storageBucket: process.env.VUE_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_MESSAGING_SENDER_ID,
  appId: process.env.VUE_APP_APP_ID,
})

const store = new Vuex.Store({
  state: {
    popup: {
      comp: '',
      payload: null,
    },
    toasts: [],
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
    moveToastQueue(state) {
      state.toasts.pop()
    },
    pushToast(state, toast) {
      state.toasts.unshift(toast)
    },
  },
  actions: {
    pushPopup({state, getters}, popup) {
      state.popup = popup
      if (!getters.isDesktop)
        router.push('/popup')
    },
  }
});

window.addEventListener('resize', () => store.commit('saveWindowWidth'))

store.commit('saveWindowWidth')

export default store
