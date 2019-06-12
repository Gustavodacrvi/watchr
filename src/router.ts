import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const isStandAlone: boolean = window.matchMedia('(display-mode: standalone)').matches

let initialPage: string = 'Home'
if (isStandAlone) {
  if (localStorage.getItem('watchrIsLogged')) {
    initialPage = 'App'
  } else {
    initialPage = 'Guest'
  }
}

const routes: any = [
  {
    path: '/',
    name: initialPage,
    component: () => import(`@/views/${initialPage}.vue`),
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
]

if (isStandAlone) {
  routes.push({
    path: '/home',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
  })
}

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})
