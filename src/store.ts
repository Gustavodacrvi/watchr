import Vue from 'vue';
import axios from 'axios';
import Vuex from 'vuex';
import defaultLanguage from '@/assets/javaScript/en';
import themes from '@/assets/javaScript/store_modules/themes';

Vue.use(Vuex);


import { setCookie, getCookie } from './assets/javaScript/cookies';

declare var language: any;

export default new Vuex.Store({
  modules: {
    theme: themes,
  },
  state: {
    savedLanguages: new Map(),
    lang: {
      name: 'en',
      strings: defaultLanguage.strings,
    },
    user: undefined,
  },
  getters: {
    l: (state: any) => (msg: string) => {
      return state.lang.strings[msg];
    },
    isAuthenticated(state: any) {
      return (state.user !== undefined);
    },
    hasLanguage(state: any, lang) {
      return state.savedLanguages.has(lang);
    },
  },
  mutations: {
    logUser(state: any, user) {
      state.user = user;
    },
    logOut(state: any) {
      state.user = undefined;
    },
    setLanguage(state: any, lang) {
      state.lang.strings = state.savedLanguages.get(lang).strings;
      state.lang.name = lang;
      setCookie('watchrLanguage', lang, 365);
    },
    saveLanguage(state: any, { lang, langObj}: any) {
      state.savedLanguages.set(lang, {
        strings: langObj.strings,
      });
    },
  },
  actions: {
    downloadLanguage({ commit, state }, lang) {
      return new Promise((resolve) => {
        const scr = document.createElement('script');
        scr.setAttribute('id', lang);
        scr.setAttribute('type', 'text/javascript');
        scr.setAttribute('src', '/assets/langs/' + lang + '.js');
        scr.onload = () => {
          state.lang.strings = language.strings;
          state.lang.name = lang;
          setCookie('watchrLanguage', lang, 365);
          commit('saveLanguage', { lang, langObj: language });
          resolve();
        };
        document.getElementsByTagName('head')[0].appendChild(scr);
      });
    },
    setPreferedLanguage({ commit, state, dispatch }) {
      const lang = getCookie('watchrLanguage');
      if (lang === '' || lang === 'en') {
        setCookie('watchrLanguage', 'en', 365);
        return new Promise((resolve) => {
          resolve();
        });
      } else {
        return dispatch('downloadLanguage', lang);
      }
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
