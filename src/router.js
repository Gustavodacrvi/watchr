import Vue from "vue"
import Router from "vue-router"

Vue.use(Router)

import LoadingComponent from './components/Illustrations/LoadingComponent.vue'
import ErrorComponent from './components/Illustrations/ErrorComponent.vue'

const AsyncComponent = (comp) => () => ({
  component: comp,
  loading: LoadingComponent,
  error: ErrorComponent,
  delay: 0,
  timeout: 7500,
})

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "home",
      component: AsyncComponent(import(/* webpackChunkName: "home-chunk" */ './views/Home.vue')),
    },
    {
      path: "/user",
      name: 'user',
      component: AsyncComponent(import(/* webpackChunkName: "user-chunk" */ './views/User.vue')),
    },
    {
      path: "/support",
      name: 'support',
      component: AsyncComponent(import(/* webpackChunkName: "home-chunk" */ './views/Support.vue')),
      children: [
        {
          path: 'article',
          component: AsyncComponent(import(/* webpackChunkName: "home-chunk" */ './components/Support/Article.vue'))
        }
      ]
    },
    {
      path: '/action',
      name: 'Action',
      component: AsyncComponent(import(/* webpackChunkName: "action-chunk" */ './views/Action.vue')),
      props: route => ({
        mode: route.query.mode,
        oobCode: route.query.oobCode,
      }),
    },
  ]
});
