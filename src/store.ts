import Vue from 'vue';
import axios from 'axios';
import Vuex from 'vuex';

Vue.use(Vuex);

interface State {
  style: string;
}

import { setCookie } from './assets/javaScript/cookies';

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
    changeLanguage(state: any, lang: string,
      ) {
      import(`@/assets/javaScript/languages/${lang}.ts`).then((file) => {
        state.lang.strings = file.strings;
        setCookie('language', lang, 365);
      });
    },
  },
  actions: {

  },
});
