
import { Routine, Interval } from '@/components/interfaces';

let savedSection = localStorage.getItem('watchrSavedUserSection');
let navigationOpened: any = localStorage.getItem('watchrSavedNavigationOpened');
if (savedSection === '') {
  savedSection = 'overview';
}
if (navigationOpened === null) {
  navigationOpened = true;
} else {
  navigationOpened = (navigationOpened === 'true');
}

export default {
  namespaced: true,
  state: {
    section: savedSection,
    navigationOpened,
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
    toggleSectionNavigation(state: any) {
      state.navigationOpened = !state.navigationOpened;
    },
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
