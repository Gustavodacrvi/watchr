import { setCookie, getCookie } from '@/assets/javaScript/cookies';

import { Routine } from '@/components/interfaces';

let savedSection = getCookie('watchrSavedUserSection');
if (savedSection === '') {
  savedSection = 'overview';
}

export default {
  namespaced: true,
  state: {
    section: savedSection,
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
      setCookie('watchrSavedUserSection', section, 265);
      state.section = section;
    },
    addRoutine(state: any, routine: Routine) {
      state.routines.push(routine);
    },
  },
  actions: {

  },
};
