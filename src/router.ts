import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import(`@/views/Home.vue`),
    },
    {
      path: '/user',
      name: 'User',
      component: () => import('@/views/User.vue'),
    },
    {
      path: '/guest',
      name: 'Guest',
      component: () => import('@/views/Guest.vue'),
    },
    {
      path: '/help',
      name: 'Help',
      component: () => import('@/views/Help.vue'),
    },
  ],
})
