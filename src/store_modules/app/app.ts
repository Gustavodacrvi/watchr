
import { Routine, Interval } from '@/components/interfaces';
import NavigationModule from '@/store_modules/app/navigation';

import { ToastBus } from '@/components/generalComponents/Toast.vue';

export default {
  namespaced: true,
  modules: {
    nav: NavigationModule,
  },
  state: {
    indexedDB: undefined,
    allowIndexDB: undefined,
    routine: {
      temporary: undefined as Routine | undefined,
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
    useIndexedDB({ state }: any, use: boolean) {
      state.indexedDB = use;
      if (use) {
        if (window.indexedDB) {
          ToastBus.$emit('addToast', {
            msg: `Your browser doesn\'t support a
             stable version of IndexedDB. Consider updating your browser or using another one.`,
            duration_seconds: null,
            type: 'error',
          });
        } else {
          let db;
          const request = indexedDB.open('MyTestDatabase');
          request.onerror = (event) => {
            ToastBus.$emit('addToast', {
              msg: `We need permission to use the IndexedDB of your browser to store data`,
              duration_seconds: null,
              type: 'error',
            });
          };
          request.onsuccess = (event: any) => {
            db = event.target.result;
            state.allowIndexDB = true;
          };
        }
      }
    },
    addTemporaryRoutine({ state, commit }: any, currentDate: string) {
      state.routine.temporary = {
        id: 'temporary',
        name: 'Temporary Routine',
        creationDate: currentDate,
        intervals: [],
        visibilityField: [
          currentDate,
        ],
      } as Routine;
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
