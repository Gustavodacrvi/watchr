import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './registerServiceWorker';
import { Route } from 'vue-router';

Vue.config.productionTip = false;

const app = new Vue({
  data: { loading: false },
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');

router.beforeEach((to, from, next) => {
  app.loading = true;
  next();
});

router.afterEach((to: Route, from: Route) => {
  app.loading = false;
});
