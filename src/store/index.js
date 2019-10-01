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

const lang = localStorage.getItem('watchrlanguage') || 'en'

const getLanguageFile = (name) => {
  return new Promise(resolve => {
    import(/* webpackMode: "lazy" */`./../assets/locales/${name}.js`)
      .then((res) => resolve(res.default))
  })
}

const store = new Vuex.Store({
  modules: {
    task, tag, list, filter,
  },
  state: {
    lang,
    language: null,
    popup: {
      comp: '',
      payload: null,
    },
    navBar: {
      options: null,
      title: "",
    },
    iconDrop: null,
    selectedTasks: [],
    isOnControl: false,
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
    isStandAlone() {
      const navigator = window.navigator
      return (navigator.standalone === true)
      || (window.matchMedia('(display-mode: standalone)').matches)
    },
    isPopupOpened(state) {
      return state.popup.comp !== ''
    },
  },
  mutations: {
    languageFile(state, language) {
      state.language = language
    },
    saveLang(state, lang) {
      getLanguageFile(lang).then((language) => {
        state.lang = lang
        state.language = language
        localStorage.setItem('watchrlanguage', lang)
      })
    },
    pushIconDrop(state, drop) {
      state.iconDrop = drop
    },
    unselectTask(state, id) {
      const i = state.selectedTasks.find(el => el === id)
      state.selectedTasks.splice(i, 1)
    },
    selectTask(state, id) {
      state.selectedTasks.push(id)
    },
    clearSelected(state) {
      state.selectedTasks = []
    },
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
    toggleControl(state, clicked) {
      state.isOnControl = clicked
    },
  },
  actions: {
    pushKeyShortcut({dispatch}, key) {
      const pop = (comp) => {
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
})

getLanguageFile(lang).then((l) => store.commit('languageFile', l))

auth.onAuthStateChanged(() => {
  const isLogged = auth.currentUser !== null
  store.commit('toggleUser', isLogged)

  const enabled = false
  if (fire && !enabled)
    fire.enablePersistence().then(() => enabled = true)
      .catch(err => {
        if (err.code === 'failed-precondition') {
          // handle error
        }
        else if (err.code === 'unimplemented')
          store.commit('pushToast', {
            name: `Firestore's persistence is not available on your browser, therefore you won't be able to use this app offline.</br>Please chose a better browser or update the current one to the latest version.`,
            seconds: 12,
            type: 'error',
          })
      })

  if (isLogged) {
    Promise.all([
      store.dispatch('tag/getData'),
      store.dispatch('list/getData'),
      store.dispatch('filter/getData'),
      store.dispatch('task/getData'),
    ]).then(() => {
      store.commit('load')
    })
  }
})

window.addEventListener('resize', () => store.commit('saveWindowWidth'))

store.commit('saveWindowWidth')

export default store
