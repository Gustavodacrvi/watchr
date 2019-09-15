
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/messaging'

const config = {
  apiKey: process.env.VUE_APP_API_KEY,
  authDomain: process.env.VUE_APP_AUTH_DOMAIN,
  databaseURL: process.env.VUE_APP_DATABASE_URL,
  projectId: process.env.VUE_APP_PROJECT_ID,
  storageBucket: process.env.VUE_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_MESSAGING_SENDER_ID,
  appId: process.env.VUE_APP_APP_ID,
}

firebase.initializeApp(config)

const messaging = firebase.messaging()

messaging.requestPermission().then(() => {
  return messaging.getToken()
}).then((token) => {
  console.log(token)
})

messaging.onMessage((payload) => {
  console.log('onMessage: ', 'payload')
})

const auth = firebase.auth()

import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/index'
import './registerServiceWorker'

store.commit('saveFirestore', firebase.firestore())

let firstTimeLoading = true

auth.onAuthStateChanged(() => {
  if (firstTimeLoading) {
    firstTimeLoading = false
    store.commit('showApp')
  }
  store.commit('saveCurrentUser', firebase.auth().currentUser)
  store.commit('saveFirebase', firebase)

  store.dispatch('settings/getData')
  store.dispatch('label/getData')
  store.dispatch('project/getData')
  store.dispatch('perspective/getData')
  store.dispatch('task/getData')
})

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')

if (store.getters.isStandAlone)
  router.replace({name: 'User'})

router.beforeEach((to: any, from: any, next: any) => {
  if (to.name !== 'User' && to.matched[0] !== undefined && to.matched[0].name !== 'User')
    store.commit('closeAppBar')

  next()
})
