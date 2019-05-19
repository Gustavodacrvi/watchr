
import { Routine, Interval } from '@/components/interfaces';
import NavigationModule from '@/store_modules/app/navigation';

export default {
  namespaced: true,
  modules: {
    nav: NavigationModule,
  },
  state: {
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
