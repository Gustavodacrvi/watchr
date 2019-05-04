import Vue from 'vue';
import axios from 'axios';
import Vuex from 'vuex';

Vue.use(Vuex);

interface State {
  style: string;
}

import { setCookie, getCookie } from './assets/javaScript/cookies';
import router from './router';

export default new Vuex.Store({
  state: {
    style: 'light',
    lang: {
      strings: undefined as any,
    },
    user: undefined,
  } as State,
  getters: {
    isAuthenticated(state: any) {
      return (state.user !== undefined);
    },
    l: (state) => (msg: string) => {
      return state.lang.strings[msg];
    },
  },
  mutations: {
    logUser(state: any, user) {
      state.user = user;
    },
    logOut(state: any) {
      state.user = undefined;
    },
    invertTheme(state: any) {
      if (state.style === 'light') {
        state.style = 'dark';
      } else {
        state.style = 'light';
      }
      setCookie('darkTheme', state.style, 365);
    },
    changeThemeTo(state: any, style: 'light' | 'dark') {
      state.style = style;
    },
    changeLanguage(state: any, lang: string) {
      import(`@/assets/javaScript/languages/${lang}.ts`).then((file) => {
        state.lang.strings = file.strings;
        setCookie('watchrLanguage', lang, 365);
        router.push(router.currentRoute);
      });
    },
  },
  actions: {
    setSavedTheme({ commit }) {
      const style = getCookie('darkTheme');
      if (style !== '') {
        commit('changeThemeTo', style);
      }
    },
    setSavedLanguage({ commit, state }) {
      let lang = getCookie('watchrLanguage');
      if (lang === '') {
        lang = 'en';
      }
      return import(`@/assets/javaScript/languages/${lang}.ts`).then((file) => {
        state.lang.strings = file.strings;
        setCookie('watchrLanguage', lang, 365);
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
