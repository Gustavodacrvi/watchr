import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

interface State {
  style: string;
}


export default new Vuex.Store({
  state: {
    style: 'light',
    user: undefined,
  } as State,
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
    invertTheme(state: any) {
      if (state.style === 'light') {
        state.style = 'dark';
      } else {
        state.style = 'light';
      }
    },
  },
  actions: {

  },
});
