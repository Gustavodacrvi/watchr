import Vue from 'vue';
import axios from 'axios';
import Vuex from 'vuex';

import themes from '@/assets/javaScript/store_modules/themes';
import languages from '@/assets/javaScript/store_modules/languages';

Vue.use(Vuex);


import { setCookie, getCookie } from './assets/javaScript/cookies';


export default new Vuex.Store({
  modules: {
    theme: themes,
    lang: languages,
  },
  state: {
    user: undefined,
    windowWidth: undefined,
  },
  getters: {
    isAuthenticated(state: any) {
      return (state.user !== undefined);
    },
  },
  mutations: {
    logUser(state: any, user) {
      state.user = user;
    },
    logOut(state: any) {
      state.user = undefined;
    },
    setWindowWidth(state: any, width: number) {
      state.windowWidth = width;
    },
  },
  actions: {
    getWindowWidthOnResize({ state }) {
      state.windowWidth = document.body.clientWidth;
      window.addEventListener('resize', () => {
        state.windowWidth = document.body.clientWidth;
      });
    },
    getUserDataIfLogged({ commit }) {
      const sessionToken = getCookie('watchrSessionToken');
      if (sessionToken !== '') {
        return axios.post('http://localhost:3000/autologin', { token: sessionToken }).then((res: any) => {
          if (res.data.validToken) {
            commit('logUser', res.data.user);
          } else {
            setCookie('watchrSessionToken', '', 30);
          }
        });
      }
      return new Promise((resolve) => {
        resolve();
      });
    },
  },
});
