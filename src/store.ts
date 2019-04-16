import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

interface Styles {
  currentTheme: string;
  light: {
    body: object;
    card: object;
  };
  [key: string]: any;
}


export default new Vuex.Store({
  state: {
    styles: {
      currentTheme: 'light',
      light: {
        body: {
          backgroundColor: '#f7f7fb',
        },
        card: {
          backgroundColor: '#fff',
        },
      },
    } as Styles,
  },
  getters: {
    card: (state) => {
      return state.styles[state.styles.currentTheme].card;
    },
    backgroundColor: (state) => {
      return state.styles[state.styles.currentTheme].body;
    },
  },
  mutations: {

  },
  actions: {

  },
});
