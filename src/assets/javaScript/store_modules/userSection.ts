import { setCookie, getCookie } from '@/assets/javaScript/cookies';

import { Routine, Interval } from '@/components/interfaces';

let savedSection = getCookie('watchrSavedUserSection');
if (savedSection === '') {
  savedSection = 'overview';
}

export default {
  namespaced: true,
  state: {
    section: savedSection,
    routines: [] as Routine[],
    intervals: [] as Interval[],
    options: {
      clockConvention: '24',
    },
    interval: undefined,
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
    addInterval(state: any, interval: Interval) {
      state.intervals.push(interval);
    },
    selectInterval(state: any, id: string) {
      state.interval = id;
    },
  },
  actions: {

  },
};
