import Vue from "vue"
import App from "./App.vue"
import router from "./router"
import store from "./store/"
import "./registerServiceWorker"

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app")

if (store.getters.isStandAlone)
  router.replace('/user')
