import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './registerServiceWorker'

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app')

const isStandAlone: boolean = window.matchMedia('(display-mode: standalone)').matches

if (isStandAlone) {
  if (localStorage.getItem('watchrIsLogged')) {
    router.replace({name: 'User'})
  } else {
    router.replace({name: 'Guest'})
  }
}
