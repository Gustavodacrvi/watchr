import Vue from 'vue';
import axios from 'axios';
import App from './App.vue';
import AppLoad from './AppLoad.vue';
import router from './router';
import store from './store';
import './registerServiceWorker';
import { Route } from 'vue-router';
import defaultLanguage from '@/assets/javaScript/en';

import { getCookie } from '@/assets/javaScript/cookies';

Vue.config.productionTip = false;


store.dispatch('theme/setSavedTheme');
store.commit('saveLanguage', { lang: 'en' , langObj: defaultLanguage});

let app = new Vue({
  data: { routerViewLoading: false },
  store,
  render: (h) => h(AppLoad),
}).$mount('#app');

Promise.all([
  store.dispatch('lang/setLanguage', getCookie('watchrLanguage')),
  store.dispatch('getUserDataIfLogged'),
]).finally(() => {

  app = new Vue({
    data: { routerViewLoading: false },
    router,
    store,
    render: (h) => h(App),
  }).$mount('#body');

  router.beforeEach((to, from, next) => {
    app.routerViewLoading = true;
    next();
  });

  router.afterEach((to: Route, from: Route) => {
    app.routerViewLoading = false;
  });
});
