import Vue from 'vue'
import Vuex, { Getter } from 'vuex'
import router from './../router'

import label from '@/store/label'
import perspective from '@/store/perspective'
import task from '@/store/task'
import settings from '@/store/settings'

const MAX_MOBILE_SCREEN_WIDTH = 992

import { SimpleAdder, Alert, Perspective, ListIcon, CenteredCard } from '@/interfaces/app'
import { IndexState, IndexMutations, IndexActions, IndexGetters, State } from '@/interfaces/store/index'

Vue.use(Vuex)

const savedTheme: IndexState.theme = localStorage.getItem('watchrTheme') as IndexState.theme || 'light'

interface Mutations {
  pushAlert: IndexMutations.PushAlert
  pushTheme: IndexMutations.PushTheme
  pushPopUp: IndexMutations.PushPopUp
  pushPopUpPayload: IndexMutations.PushPopUpPayload
  saveCurrentUser: IndexMutations.SaveCurrentUser
  saveFirestore: IndexMutations.SaveFirestore
  hideExtraActions: IndexMutations.HideExtraActions
  showExtraActions: IndexMutations.ShowExtraActions
  pushCenteredCard: IndexMutations.PushCenteredCard
  openSection: IndexMutations.OpenSection
  saveFirebase: IndexMutations.SaveFirebase
  pushAppView: IndexMutations.PushAppView
  pushPerspective: IndexMutations.PushPerspective
  pushView: IndexMutations.PushView
  addNavBarTitle: IndexMutations.AddNavBarTitle
  sendOptionsToNavbar: IndexMutations.SendOptionsToNavbar
  showApp: IndexMutations.ShowApp
  hideNavBarOptions: IndexMutations.HideNavBarOptions
  openAppBar: IndexMutations.OpenAppBar
  closeAppBar: IndexMutations.CloseAppBar
  resetPopUpState: IndexMutations.ResetPopUpState
  hideAlert: IndexMutations.HideAlert
  [key: string]: (state: State, payload: any) => void
}

interface Getters {
  isDesktop: (state: State) => IndexGetters.IsDesktop
  isStandAlone: (state: State) => IndexGetters.IsStandAlone
  platform: (state: State) => IndexGetters.Platform
  isOnAppRoute: (state: State) => IndexGetters.IsOnAppRoute
  perspectiveData: (state: State) => IndexGetters.PerspectiveData
  loggedAndVerified: (state: State) => IndexGetters.LoggedAndVerified
  loggedAndNotVerified: (state: State) => IndexGetters.LoggedAndNotVerified
  anonymous: (state: State) => IndexGetters.Anonymous
  [key: string]: (state: State, getters: Getters) => void
}

interface ActionContext {
  state: State
  getters: Getters
  commit: (mutation: string, payload?: any) => void
  dispatch: (action: string) => void
}

interface Actions {
  getWindowWidthOnResize: IndexActions.GetWindowWidthOnResize
  showLastAlert: IndexActions.ShowLastAlert
  activateKeyShortcut: IndexActions.activateKeyShortcut
  [key: string]: (context: ActionContext, payload: any) => any
}

const store: any = new Vuex.Store({
  modules: {
    label, perspective, task, settings,
  } as any,
  state: {
    theme: savedTheme,
    popUpComponent: '',
    showingExtraActions: false,
    popUpPayload: null,
    navBarTitle: '',
    windowWidth: document.body.clientWidth,
    appBarState: false,
    isLogged: false,
    firestore: null,
    centeredCard: null,
    viewName: '',
    viewType: '',
    isAnonymous: false,
    emailVerified: false,
    loading: true,
    firebase: null,
    currentAppSection: '',
    navBarOptions: [],
    appError: false,
    uid: null,
    showingAlert: false,
    alerts: [],
    alert: undefined,
  } as State,
  mutations: {
    hideExtraActions(state) {
      state.showingExtraActions = false
    },
    showExtraActions(state) {
      state.showingExtraActions = true
    },
    openSection(state, currentAppSection) {
      state.currentAppSection = currentAppSection
    },
    saveFirestore(state, firestore) {
      state.firestore = firestore
      if (state.firestore)
        state.firestore.enablePersistence()
          .catch(err => {
            if (err.code === 'failed-precondition')
              state.appError = true
            else if (err.code === 'unimplemented')
              state.alerts.push({
                // tslint:disable-next-line:max-line-length
                name: `Firestore's persistence is not available on your browser, therefore you won't be able to use this app offline.</br>Please chose a better browser or update the current one to the latest version.`,
                duration: 12,
                type: 'error',
              })
          })
    },
    saveFirebase(state, firebase) {
      state.firebase = firebase
    },
    pushTheme(state, theme) {
      state.theme = theme
      localStorage.setItem('watchrTheme', theme)
    },
    saveCurrentUser(state, user) {
      if (user !== null) {
        state.isLogged = true
        state.isAnonymous = user.isAnonymous
        state.emailVerified = user.emailVerified
        state.uid = user.uid
      } else {
        state.isLogged = false
        state.isAnonymous = false
        state .emailVerified = false
        state.uid = null
      }
    },
    resetPopUpState(state) {
      state.popUpComponent = ''
      state.popUpPayload = null
    },
    pushCenteredCard(state, centeredCardPopUp) {
      state.centeredCard = centeredCardPopUp
    },
    pushPopUp(state, compName) {
      const isDesktop = state.windowWidth > MAX_MOBILE_SCREEN_WIDTH
      if (!isDesktop && compName === '' && state.popUpComponent !== '')
        router.go(-1)
      if (!isDesktop && compName !== '' && state.popUpComponent === '')
        router.push({ name: 'Popup' })
      state.popUpComponent = compName
      state.popUpPayload = null
    },
    pushPopUpPayload(state, payload) {
      state.popUpPayload = payload
    },
    showApp(state) {
      state.loading = false
    },
    pushAlert(state, alert) {
      state.alerts.push(alert)
    },
    hideAlert(state) {
      state.showingAlert = false
    },
    openAppBar(state) {
      state.appBarState = true
    },
    closeAppBar(state) {
      state.appBarState = false
    },
    pushView(state, {view, viewType}) {
      state.viewName = view
      state.viewType = viewType
    },
    addNavBarTitle(state, title) {
      state.navBarTitle = title
    },
    sendOptionsToNavbar(state, options) {
      state.navBarOptions = options
    },
    hideNavBarOptions(state) {
      state.navBarOptions = []
    },
  },
  getters: {
    platform(state: any, getters: Getters) {
      if (getters.isDesktop)
        return 'desktop'
      return 'mobile'
    },
    isDesktop(state): boolean {
      if (state.windowWidth > MAX_MOBILE_SCREEN_WIDTH)
        return true
      return false
    },
    isStandAlone(state: State): boolean {
      const navigator: any = window.navigator
      return (navigator.standalone === true)
      || (window.matchMedia('(display-mode: standalone)').matches)
    },
    loggedAndVerified(state: State) {
      return state.isLogged && state.emailVerified
    },
    loggedAndNotVerified(state: State) {
      return state.isLogged && !state.emailVerified
    },
    anonymous(state: State) {
      return state.isLogged && state.isAnonymous
    },
    perspectiveData(state: State) {
      const s = state as any
      return s.perspective.customPerspectives.find((el: Perspective) => el.name === state.viewName)
    },
  } as Getters,
  actions: {
    getWindowWidthOnResize({state, getters, commit}) {
      window.addEventListener('resize', () => {
        const oldWidth = state.windowWidth
        state.windowWidth = document.body.clientWidth
        if (!getters.isDesktop && state.windowWidth !== oldWidth)
          commit('closeAppBar')
      })
    },
    showLastAlert({state}) {
      const NUMBER_OF_MILISECONDS_IN_ONE_SECOND = 1000
      if (state.alerts.length !== 0 && !state.showingAlert) {
        state.alert = state.alerts.shift() as Alert
        state.showingAlert = true
        if (state.alert.duration)
          setTimeout(() => {
            state.showingAlert = false
          }, state.alert.duration * NUMBER_OF_MILISECONDS_IN_ONE_SECOND)
      }
    },
    activateKeyShortcut({commit, getters}, key) {
      if ((getters.loggedAndVerified || getters.anonymous))
        switch (key.toLowerCase()) {
          case 'l': commit('pushPopUp', 'LabeladderPopup'); break
          case 'p': commit('pushPopUp', 'PerspectiveAdderPopup'); break
          case 't': commit('pushPopUp', 'TaskadderPopup'); break
          case 'h': commit('pushPopUp', ''); break
        }
    },
  } as Actions,
})

store.dispatch('getWindowWidthOnResize')

export default store
