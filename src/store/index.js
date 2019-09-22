import Vue from "vue"
import Vuex from "vuex"
import router from './../router'

Vue.use(Vuex)

const MINIMUM_DESKTOP_SCREEN_WIDTH = 820

import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

firebase.initializeApp({
  apiKey: process.env.VUE_APP_API_KEY,
  authDomain: process.env.VUE_APP_AUTH_DOMAIN,
  databaseURL: process.env.VUE_APP_DATABASE_URL,
  projectId: process.env.VUE_APP_PROJECT_ID,
  storageBucket: process.env.VUE_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_MESSAGING_SENDER_ID,
  appId: process.env.VUE_APP_APP_ID,
})


export const fire = firebase.firestore()
export const auth = firebase.auth()

import task from './task'
import tag from './tag'
import list from './list'
import filter from './filter'

const store = new Vuex.Store({
  modules: {
    task, tag, list, filter,
  },
  state: {
    popup: {
      comp: '',
      payload: null,
    },
    navBar: {
      options: null,
      title: "",
    },
    authState: false,
    isLoading: true,
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
    pushNavBarData(state, navBar) {
      state.navBar = navBar
    },
    load(state) {
      state.isLoading = false
    },
    toggleUser(state, isLogged) {
      state.authState = isLogged
    },
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
    pushKeyShortcut({dispatch}, key) {
      const pop = (comp) => {
        console.log(comp)
        dispatch('pushPopup', {comp})
      }
      switch (key.toLowerCase()) {
        case 'q': pop('AddTask'); break
        case 't': pop('AddTag'); break
        case 'l': pop('AddList'); break
      }
    },
    pushPopup({state, getters}, popup) {
      state.popup = popup
      if (!getters.isDesktop)
        router.push('/popup')
    },
  }
});

auth.onAuthStateChanged(() => {
  const isLogged = auth.currentUser !== null
  store.commit('toggleUser', isLogged)

  if (isLogged) {
    Promise.all([
      store.dispatch('tag/getData'),
      store.dispatch('list/getData'),
      store.dispatch('filter/getData'),
    ]).then(() => {
      store.commit('load')
    })
  }
})

window.addEventListener('resize', () => store.commit('saveWindowWidth'))

store.commit('saveWindowWidth')

export default store