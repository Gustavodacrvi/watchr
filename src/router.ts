import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import LoadingComponent from './components/LoadingComponent.vue'
import ErrorComponent from './components/ErrorComponent.vue'

const AsyncComponent = (compPath: string): any => () => ({
  component: import(`${compPath}`),
  loading: LoadingComponent,
  error: ErrorComponent,
  delay: 200,
  timeout: 5000,
})

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'Home',
      component: AsyncComponent(`./views/Home.vue`),
    },
    {
      path: '/user',
      name: 'User',
      component: AsyncComponent('./views/User.vue'),
    },
    {
      path: '/help',
      name: 'Help',
      component: AsyncComponent('./views/Help.vue'),
    },
  ],
})
