import { Routine } from '@/components/interfaces';

export default {
  namespaced: true,
  state: {
    section: 'overview',
    routines: [] as Routine[],
  },
  getters: {
    getRoutine: (state: any) => (key: string) => {
      return state.routines.find((el: Routine) => {
        return el.id === key;
      });
    },
  },
  mutations: {
    pushSection(state: any, section: string) {
      state.section = section;
    },
    addRoutine(state: any, routine: Routine) {
      state.routines.push(routine);
    },
  },
  actions: {

  },
};
