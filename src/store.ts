import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    styles: {
      card: {
        backgroundColor: '#fff',
      },
    },
  },
  getters: {
    card: state => {
      return state.styles.card;
    }
  },
  mutations: {

  },
  actions: {

  },
});
