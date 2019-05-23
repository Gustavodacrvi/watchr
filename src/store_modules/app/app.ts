
import { Routine, Interval, DateInterval } from '@/components/interfaces';
import NavigationModule from '@/store_modules/app/navigation';
import { app } from '@/components/mixins';

export default {
  namespaced: true,
  modules: {
    nav: NavigationModule,
  },
  state: {
    webStorage: undefined,
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
    getRoutineById: (state: any) => (key: string): string => {
      return state.routine.routines.find((el: Routine) => {
        return el.id === key;
      });
    },
    isVisible: (state: any) => (arr: Array<any>, value: Date | DateInterval): boolean => {
      let length = arr.length;
      if (value instanceof Date) {
        for (let i = 0;i < length;i++) {
          if (arr[i] instanceof Date && arr[i] === value) {
            return true;
          }
        }
      }
      return false;
    },
    getRoutineByDate: (state: any, getters: any) => (date: Date): string => {
      return state.routine.routines.find((el: Routine) => {
        return getters.isVisible(el.id, date);
      });
    },
    getTodaysRoutine(state: any, getters: any): Routine {
      if (state.routine.temporary) {
        
      } else {
        return getters.getRoutineByDate(new Date());
      }
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
        console.log(state.interval)
        console.log(state.routine)
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
    deleteLocalStorageData() {
      localStorage.removeItem('watchrRoutines');
      localStorage.removeItem('watchrIntervals');
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
