import Vue from 'vue';
import Router from 'vue-router';
import Home from './components/views/Home.vue';
import Login from './components/views/Login.vue';
import Signup from './components/views/Signup.vue';
import User from './components/views/User.vue';

import store from './store';

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
        next('/login');
      },
    },
  ],
});
