import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

interface State {
  style: string;
}


export default new Vuex.Store({
  state: {
    style: 'light',
  } as State,
  getters: {
    card: (state) => {
      return 'card-' + state.style;
    },
    bodyBackground: (state) => {
      return 'bodyBackground-' + state.style;
    },
  },
  mutations: {

  },
  actions: {

  },
});
