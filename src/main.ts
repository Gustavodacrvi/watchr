
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/index'
import './registerServiceWorker'
import { FontAwesomeIcon, FontAwesomeLayers } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faUser, faAdjust, faSignInAlt, faUserAlt, faUserPlus } from '@fortawesome/free-solid-svg-icons'
import { dom } from '@fortawesome/fontawesome-svg-core'
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

console.log(process.env)
console.log(process.env.NODE_ENV)
console.log(process.env.API_KEY)

const config = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  databaseURL: process.env.DATABASE_URL,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
}

firebase.initializeApp(config)

library.add(faUser, faAdjust, faUserAlt, faSignInAlt, faUserPlus)

dom.watch()

Vue.component('ft-icon', FontAwesomeIcon)
Vue.component('ft-icon-layers', FontAwesomeLayers)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')

if (store.getters.isStandAlone)
  router.replace({name: 'User'})

router.beforeEach((to: any, from: any, next: any) => {
  if (to.name !== 'User')
    store.commit('closeAppBar')

  next()
})
