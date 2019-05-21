
import { Routine, Interval } from '@/components/interfaces';
import NavigationModule from '@/store_modules/app/navigation';

export default {
  namespaced: true,
  modules: {
    nav: NavigationModule,
  },
  state: {
    webStorage: undefined,
    routine: {
      temporaly: undefined as Routine | undefined,
      routines: [] as Routine[],
    },
    intervals: [] as Interval[],
    options: {
      clockConvention: '24',
    },
  },
  getters: {
    getRoutine: (state: any) => (key: string) => {
      return state.routine.routines.find((el: Routine) => {
        return el.id === key;
      });
    },
  },
  mutations: {
    useWebStorage(state: any, use: boolean) {
      state.webStorage = use;
      if (use) {
        const data = localStorage.getItem('watchrRoutines');
        if (data !== null) {
          state.routine = JSON.parse(data);
        }
      }
    },
    addRoutine(state: any, routine: Routine) {
      state.routines.push(routine);
    },
    addInterval(state: any, interval: Interval) {
      state.intervals.push(interval);
    },
    saveRoutines(state: any) {
      if (state.webStorage) {
        localStorage.setItem('watchrRoutines', JSON.stringify(
          state.routine,
        ));
      }
    },
  },
  actions: {
    addTemporaryRoutine({ state, commit }: any, currentDate: string) {
      state.routine.routines.push({
        id: 'temporary',
        name: 'Temporary Routine',
        creationDate: currentDate,
        intervals: [],
        visibilityField: [
          currentDate,
        ],
      } as Routine);
      commit('saveRoutines');
    },
  },
};
