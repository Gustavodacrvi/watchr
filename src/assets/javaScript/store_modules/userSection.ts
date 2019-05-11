
export default {
  namespaced: true,
  state: {
    section: 'overview',
  },
  getters: {

  },
  mutations: {
    pushSection(state: any, section: string) {
      state.section = section;
    },
  },
  actions: {

  },
};
