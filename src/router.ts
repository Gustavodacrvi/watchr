import Vue from 'vue';
import Router from 'vue-router';
import Home from './components/views/Home.vue';
import Login from './components/views/Login.vue';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
  ],
});
