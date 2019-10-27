import Vue from "vue"
import Vuex from "vuex"
import router from './../router'

import moment from 'moment'

Vue.use(Vuex)

const MINIMUM_DESKTOP_SCREEN_WIDTH = 820

import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/storage'

firebase.initializeApp({
  apiKey: process.env.VUE_APP_API_KEY,
  authDomain: process.env.VUE_APP_AUTH_DOMAIN,
  projectId: process.env.VUE_APP_PROJECT_ID,
  storageBucket: process.env.VUE_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_MESSAGING_SENDER_ID,
  appId: process.env.VUE_APP_APP_ID,
  databaseURL: process.env.VUE_APP_DATABASE_URL,
  storageBucket: process.env.VUE_APP_STORAGE_BUCKET_URL,
})


export const fire = firebase.firestore()
export const auth = firebase.auth()
export const sto = firebase.storage()

import task from './task'
import tag from './tag'
import list from './list'
import filter from './filter'
import user from './user'

const lang = localStorage.getItem('watchrlanguage') || 'en'

const getLanguageFile = (name) => {
  return new Promise(resolve => {
    import(/* webpackMode: "lazy" */`./../assets/locales/${name}.js`)
      .then((res) => resolve(res.default))
  })
}

moment.locale(lang)

const store = new Vuex.Store({
  modules: {
    task, tag, list, filter, user,
  },
  state: {
    lang,
    language: null,
    popup: {
      comp: '',
      payload: null,
      callback: null,
    },
    navBar: {
      options: null,
      title: "",
    },
    iconDrop: null,
    selectedEls: [],
    apply: {
      taskId: null,
      bool: false,
    },
    user: null,
    firstFireLoad: false,
    selectedTasks: [],
    isOnControl: false,
    fireBaseFirstLoaded: false,
    authState: false,
    firstFireLoad: false,
    fastSearch: false,
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
    l(state) {
      return state.language
    },
  },
  mutations: {
    openFastSearch(state) {
      state.fastSearch = true
    },
    closeFastSearch(state) {
      state.fastSearch = false
    },
    saveUser(state, user) {
      state.user = user
    },
    firstFirebaseLoad(state) {
      state.firstFireLoad = true
    },
    applyAppnavSelected(state, id) {
      state.apply.taskId = id
      state.apply.bool = !state.apply.bool
    },
    appnavSelected(state, selected) {
      state.selectedEls = selected
    },
    languageFile(state, language) {
      state.language = language
    },
    saveLang(state, lang) {
      getLanguageFile(lang).then((language) => {
        state.lang = lang
        state.language = language
        localStorage.setItem('watchrlanguage', lang)
        location.reload()
      })
    },
    pushIconDrop(state, drop) {
      state.iconDrop = drop
    },
    unselectTask(state, id) {
      setTimeout(() => {
        const i = state.selectedTasks.findIndex(el => el === id)
        state.selectedTasks.splice(i, 1)
      }, 10)
    },
    selectTask(state, id) {
      setTimeout(() => {
        state.selectedTasks.push(id)
      }, 10)
    },
    clearSelected(state) {
      if (state.selectedTasks.length !== 0)
        state.selectedTasks = []
    },
    pushNavBarData(state, navBar) {
      state.navBar = navBar
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
    logOut({state}) {
      auth.signOut().then(() => {
        state.authState = false
        window.location.reload()
      })
    },
    pushKeyShortcut({dispatch, commit}, key) {
      const pop = (comp) => {
        dispatch('pushPopup', {comp})
      }
      switch (key.toLowerCase()) {
        case 'q': pop('AddTask'); break
        case 't': pop('AddTag'); break
        case 'l': pop('AddList'); break
        case 'f': commit('openFastSearch'); break
      }
    },
    pushPopup({state, getters}, popup) {
      state.popup = popup
      if (!getters.isDesktop)
        router.push('/popup')
    },
    deleteProfilePic() {
      const str = `images/${auth.currentUser.uid}.jpg`
      sto.ref(str).delete().then(() => {
        auth.currentUser.updateProfile({
          photoURL: '',
        }).then(() => window.location.reload())
      })
    },
    deleteAccount({state, dispatch}) {
      dispatch('tag/deleteAllData')
      dispatch('list/deleteAllData')
      dispatch('task/deleteAllData')
      dispatch('filter/deleteAllData')
      dispatch('user/deleteAllData')
      firebase.auth().currentUser.delete()
      setTimeout(() => {
        router.push('/')
        dispatch('deleteProfilePic')
        window.location.reload()
      }, 100)
    },
  }
})

getLanguageFile(lang).then((l) => store.commit('languageFile', l))

let enabled = false
auth.onAuthStateChanged((user) => {
  const isLogged = user !== null
  store.commit('toggleUser', isLogged)
  store.commit('saveUser', user)
  store.commit('firstFirebaseLoad')
  if (!isLogged) return;

  const dispatch = store.dispatch
  const loadData = () => {
    dispatch('tag/getData')
    dispatch('list/getData')
    dispatch('filter/getData')
    dispatch('task/getData')
    dispatch('user/getData')
  }
  const toast = (t) => store.commit('pushToast', t)

  if (!user.isAnonymous) {
    if (fire && !enabled && user && user.emailVerified)
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

    if (isLogged) loadData()
  } else {
    const uid = user.uid
    setTimeout(() => {
      toast({
        name: store.getters.l['Anonymous users are deleted every week, sign in to save your data indefinitely.'],
        seconds: 7,
        type: 'warning',
      })
    }, 3000)
    dispatch('tag/addDefaultData', uid)
    dispatch('list/addDefaultData', uid)
    dispatch('filter/addDefaultData', uid)
    loadData()
  }
})

window.addEventListener('resize', () => store.commit('saveWindowWidth'))

store.commit('saveWindowWidth')

export default store
