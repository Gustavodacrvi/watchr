
export default {
  namespaced: true,
  state: {
    section: 'overview',
    routines: new Map() as Map<string, object>,
  },
  getters: {
    getRoutine: (state: any) => (key: string) => {
      return state.routines.get(key);
    },
  },
  mutations: {
    pushSection(state: any, section: string) {
      state.section = section;
    },
  },
  actions: {

  },
};
