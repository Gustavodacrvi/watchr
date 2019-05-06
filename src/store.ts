import Vue from 'vue';
import axios from 'axios';
import Vuex from 'vuex';
import defaultLanguage from '@/assets/javaScript/en';

import themes from '@/assets/javaScript/store_modules/themes';
import languages from '@/assets/javaScript/store_modules/languages';

Vue.use(Vuex);


import { setCookie, getCookie } from './assets/javaScript/cookies';

declare var language: any;

export default new Vuex.Store({
  modules: {
    theme: themes,
    lang: languages,
  },
  state: {
    user: undefined,
  },
  getters: {
    l: (state: any) => (msg: string) => {
      return state.lang.strings[msg];
    },
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
  },
  actions: {
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
