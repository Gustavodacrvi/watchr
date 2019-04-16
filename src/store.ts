import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

interface Styles {
  currentTheme: string;
  light: {
    card: {
      backgroundColor: string;
    };
  };
  [key: string]: any;
}


export default new Vuex.Store({
  state: {
    styles: {
      currentTheme: 'light',
      light: {
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
  },
  mutations: {

  },
  actions: {

  },
});
