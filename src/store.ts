import Vue from 'vue';
import axios from 'axios';
import Vuex from 'vuex';

import themes from '@/assets/javaScript/store_modules/themes';
import languages from '@/assets/javaScript/store_modules/languages';
import userSection from '@/assets/javaScript/store_modules/app/app';

Vue.use(Vuex);


import { setCookie, getCookie } from './assets/javaScript/cookies';


export default new Vuex.Store({
  modules: {
    theme: themes,
    lang: languages,
    app: userSection,
  },
  state: {
    user: undefined,
    windowWidth: undefined,
    mobileSectionOpened: false,
  },
  getters: {
    isAuthenticated(state: any) {
      return (state.user !== undefined);
    },
    NavbarisOnDesktop(state: any) {
      if (state.windowWidth > 1025) {
        return true;
      }
      return false;
    },
    isOnApp(state: any) {
      let isPWA = false;
      if (window.matchMedia('(display-mode: standalone)').matches) {
        isPWA = true;
      }
      return !this.NavbarisOnDesktop && this.isStandAlone;
    },
    isStandAlone() {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        return true;
      }
      return false;
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
    showMobileSection(state: any) {
      const content: any = document.getElementById('content');
      const mobile: any = document.getElementById('mobile-section');
      state.mobileSectionOpened = true;

      mobile.style.right = '0px';
      content.style.right = '150px';
    },
    hideMobileSection(state: any) {
      const content: any = document.getElementById('content');
      const mobile: any = document.getElementById('mobile-section');
      state.mobileSectionOpened = false;

      if (mobile) {
        mobile.style.right = '-150px';
      }
      content.style.right = '0';
    },
  },
  actions: {
    getWindowWidthOnResize({ state, getters, commit }) {
      state.windowWidth = document.body.clientWidth;
      window.addEventListener('resize', () => {
        state.windowWidth = document.body.clientWidth;
        if (getters.NavbarisOnDesktop) {
          commit('hideMobileSection');
        }
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
