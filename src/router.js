import Vue from "vue";
import Router from "vue-router";

import Home from "./views/Home.vue";
import Action from "./views/Action.vue";
import User from "./views/User.vue";

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "home",
      component: Home
    },
    {
      path: "/user",
      name: 'user',
      component: User,
    },
    {
      path: "/about",
      name: 'about',
      component: Home,
    },
    {
      path: '/action',
      name: 'Action',
      component: Action,
      props: route => ({
        mode: route.query.mode,
        oobCode: route.query.oobCode,
      }),
    },
  ]
});
