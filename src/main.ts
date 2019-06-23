import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/index'
import './registerServiceWorker'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import importIcons from './iconsLibrary'

importIcons()

Vue.component('ft-icon', FontAwesomeIcon)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app')

if (store.getters.isStandAlone) {
  router.replace({name: 'User'})
}

router.beforeEach((to: any, from: any, next: any) => {
  if (to.name !== 'User') {
    store.commit('closeAppBar')
  }

  next()
})
