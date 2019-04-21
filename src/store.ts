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
    style: (state) => (className: string): string => {
      return className + '-' + state.style;
    },
  },
  mutations: {

  },
  actions: {

  },
});
