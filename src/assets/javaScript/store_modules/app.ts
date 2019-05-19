
import { Routine, Interval } from '@/components/interfaces';

let savedSection = localStorage.getItem('watchrSavedUserSection');
let appNavigationOpen: any = localStorage.getItem('watchrSavedNavigationOpened');
if (savedSection === '') {
  savedSection = 'overview';
}
if (appNavigationOpen === null) {
  appNavigationOpen = true;
} else {
  appNavigationOpen = (appNavigationOpen === 'true');
}

export default {
  namespaced: true,
  state: {
    section: savedSection,
    appNavigationOpen,
    currentNavigationIcon: 'home',
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
      console.log(section)
      localStorage.setItem('watchrSavedUserSection', section);
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
