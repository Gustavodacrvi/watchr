import { setCookie, getCookie } from '@/assets/javaScript/cookies';

export default {
  namespaced: true,
  state: {
    style: 'light',
  },
  mutations: {
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
  },
  actions: {
    setSavedTheme({ commit }: any) {
      const style = getCookie('darkTheme');
      if (style !== '') {
        commit('changeThemeTo', style);
      }
    },
  },
};
