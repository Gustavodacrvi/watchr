import Vue from 'vue';
import Router from 'vue-router';

import store from '@/store';
import { ToastBus } from '@/components/regular/Toast.vue';
import { ToastObj } from '@/components/interfaces';

import { setCookie } from '@/assets/javaScript/cookies';

Vue.use(Router);

const lazyLoad = (view: any) => {
  return () => import(`@/components/${view}.vue`);
};

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'home',
      component: lazyLoad('views/Home'),
    },
    {
      path: '/login',
      name: 'login',
      component: lazyLoad('auth/views/Login'),
    },
    {
      path: '/signup',
      name: 'signup',
      component: lazyLoad('auth/views/Signup'),
    },
    {
      path: '/guest',
      name: 'guest',
      component: lazyLoad('views/Guest'),
    },
    {
      path: '/user',
      name: 'user',
      component: lazyLoad('views/User'),
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
          msg: store.getters['lang/l']('logoutToast'),
          duration_seconds: 5,
          type: 'success',
        } as ToastObj);
        next('/login');
      },
    },
  ],
});
