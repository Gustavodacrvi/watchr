
import { Routine, Interval } from '@/components/interfaces';
import NavigationModule from '@/store_modules/app/navigation';

export default {
  namespaced: true,
  modules: {
    nav: NavigationModule,
  },
  state: {
    webStorage: undefined,
    routines: [] as Routine[],
    intervals: [] as Interval[],
    options: {
      clockConvention: '24',
    },
  },
  getters: {
    getRoutine: (state: any) => (key: string) => {
      return state.routines.find((el: Routine) => {
        return el.id === key;
      });
    },
  },
  mutations: {
    useWebStorage(state: any, use: boolean) {
      state.webStorage = use;
      if (use) {
        const data = localStorage.getItem('watchrData');
        if (data !== null) {
          state = JSON.parse(data);
        }
      }
    },
    addRoutine(state: any, routine: Routine) {
      state.routines.push(routine);
    },
    addInterval(state: any, interval: Interval) {
      state.intervals.push(interval);
    },
  },
  actions: {

  },
};
