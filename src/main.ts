import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './registerServiceWorker';
import { Route } from 'vue-router';

import { getCookie } from './assets/javaScript/cookies';

Vue.config.productionTip = false;

let lang: string = getCookie('language');
if (lang === '') {
  lang = 'en';
}

store.commit('changeLanguage', lang);

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
