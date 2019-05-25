
import { Routine, Interval, DateInterval, Tag, ToastObj } from '@/components/interfaces';
import NavigationModule from '@/store_modules/app/navigation';

// this error doesn't make sense, just leave it there
import { ToastBus } from '@/components/generalComponents/Toast.vue';

const sameDay = (d1: Date, d2: Date) => {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
};

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
    tags: {
      labels: [] as Tag[],
    },
    options: {
      clockConvention: '24',
    },
  },
  getters: {
    labelExists: (state: any) => (labelName: string): boolean => {
      const values = labelName.split(':');
      const labels = state.tags.labels;
      if (values.length === 1) {
        const length = labels.length;
        for (let i = 0; i < length; i++) {
          if (labels[i].name === values[0]) {
            return true;
          }
        }
        return false;
      }
      return true;
    },
    getRoutineById: (state: any) => (key: string): string => {
      return state.routine.routines.find((el: Routine) => {
        return el.id === key;
      });
    },
    isVisible: (state: any) => (arr: any[], value: Date | DateInterval): boolean => {
      const length = arr.length;
      if (value instanceof Date) {
        for (let i = 0; i < length; i++) {
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
      if (state.routine.temporary && sameDay(new Date(state.routine.temporary.creationDate), new Date())) {
        return state.routine.temporary;
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
        data = localStorage.getItem('watchrTags');
        if (data !== null) {
          state.tags = JSON.parse(data);
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
    saveTags(state: any) {
      if (state.webStorage) {
        localStorage.setItem('watchrTags', JSON.stringify(
          state.tags,
        ));
      }
    },
    deleteLocalStorageData() {
      localStorage.removeItem('watchrRoutines');
      localStorage.removeItem('watchrIntervals');
      localStorage.removeItem('watchrTags');
    },
  },
  actions: {
    addTemporaryRoutine({ state, commit }: any) {
      state.routine.temporary = {
        id: 'temporary',
        name: 'Temporary Routine',
        creationDate: new Date(),
        intervals: [],
        visibilityField: [
        ],
      } as Routine;
      commit('saveRoutines');
    },
    addRoutine({ state, commit }: any, routine: Routine) {
      state.routines.push(routine);
      commit('saveRoutines');
    },
    deleteRoutineById({ state, commit }: any, id: string) {
      if (id === 'temporary') {
        state.routine.temporary = undefined;
      } else {
        const index = state.routine.routines.findIndex((el: Routine) => {
          return el.id === id;
        });
        state.routines.splice(index, 1);
      }
      commit('saveRoutines');
    },
    deleteLabelById({ state, commit }: any, id: string) {
      const index = state.tags.labels.findIndex((el: Tag) => {
        return el.id === id;
      });
      state.tags.labels.splice(index, 1);
      commit('saveTags');
    },
    addInterval({ state, commit }: any, interval: Interval) {
      state.intervals.push(interval);
      commit('saveIntervals');
    },
    addLabel({ state, commit }: any, label: Tag) {
      state.tags.labels.push(label);
      commit('saveTags');
      ToastBus.$emit('addToast', {
        msg: 'Added label successfuly',
        duration_seconds: 3,
        type: 'success',
      } as ToastObj);
    },
  },
};
