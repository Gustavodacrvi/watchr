
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
    interval: {
      intervals: [] as Interval[],
    },
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
        let data = localStorage.getItem('watchrRoutines');
        if (data !== null) {
          state.routine = JSON.parse(data);
        }
        data = localStorage.getItem('watchrIntervals');
        if (data !== null) {
          state.interval = JSON.parse(data);
        }
      }
    },
    saveRoutines(state: any) {
      if (state.webStorage) {
        localStorage.setItem('watchrRoutines', JSON.stringify(
          state.routine,
        ));
      }
    },
    saveIntervals(state: any) {
      if (state.webStorage) {
        localStorage.setItem('watchrIntervals', JSON.stringify(
          state.interval,
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
    addRoutine({ state, commit }: any, routine: Routine) {
      state.routines.push(routine);
      commit('saveRoutines');
    },
    addInterval({ state, commit }: any, interval: Interval) {
      state.intervals.push(interval);
      commit('saveIntervals');
    },
  },
};
