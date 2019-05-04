import Vue from 'vue';
import Router from 'vue-router';

import store from './store';
// This warning doesn't make sense, just leave it there.
import { ToastBus } from './components/generalComponents/Toast.vue';
import { ToastObj } from './components/interfaces';

import { setCookie } from './assets/javaScript/cookies';

Vue.use(Router);

const lazyLoad = (view: any) => {
  return () => import(`@/components/views/${view}.vue`);
};

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'home',
      component: lazyLoad('Home'),
    },
    {
      path: '/login',
      name: 'login',
      component: lazyLoad('Login'),
    },
    {
      path: '/signup',
      name: 'signup',
      component: lazyLoad('Signup'),
    },
    {
      path: '/user',
      name: 'user',
      component: lazyLoad('User'),
      beforeEnter: (to, from, next) => {
        if (store.getters.isAuthenticated) {
          next();
        } else {
          next('/login');
        }
      },
    },
    {
      path: '/logout',
      name: 'logout',
      beforeEnter: (to, from, next) => {
        store.commit('logOut');
        setCookie('watchrSessionToken', '', 30);
        ToastBus.$emit('addToast', {
          msg: store.getters.l('logoutToast'),
          duration_seconds: 5,
          type: 'success',
        } as ToastObj);
        next('/login');
      },
    },
  ],
});
