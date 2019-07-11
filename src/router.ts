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
      path: '/home',
      name: 'Home',
      component: AsyncComponent(`./views/Home.vue`),
    },
    {
      path: '/user',
      name: 'User',
      component: AsyncComponent('./views/User.vue'),
    },
    {
      path: '/settings',
      name: 'Settings',
      component: AsyncComponent('./views/Settings.vue'),
      children: [
        {
          path: 'about',
          name: 'About',
          component: AsyncComponent('./views/Settings/About.vue'),
        },
        {
          path: 'general',
          name: 'General',
          component: AsyncComponent('./views/Settings/General.vue'),
        },
        {
          path: 'privacy-policy',
          name: 'Privacy policy',
          component: AsyncComponent('./views/Settings/PrivacyPolicy.vue'),
        },
        {
          path: 'security-policy',
          name: 'Security policy',
          component: AsyncComponent('./views/Settings/SecurityPolicy.vue'),
        },
        {
          path: 'terms-of-service',
          name: 'Terms of service',
          component: AsyncComponent('./views/Settings/TermsofService.vue'),
        },
      ],
    },
    {
      path: '/action',
      name: 'Action',
      component: AsyncComponent('./views/Action.vue'),
      props: (route: any) => ({
        mode: route.query.mode,
        oobCode: route.query.oobCode,
      }),
    },
  ],
})
