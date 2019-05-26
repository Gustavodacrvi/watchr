
import uuid from 'uuid';

import { Routine, Interval, DateInterval, Tag, ToastObj } from '@/components/interfaces';
import NavigationModule from '@/store_modules/app/navigation';

// this error doesn't make sense, just leave it there
import { ToastBus } from '@/components/regular/Toast.vue';

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
    labelBranchExists: (state: any, getters: any) => (branch: string[], labels: any): boolean => {
      if (labels === undefined) {
        labels = state.tags.labels;
      }

      const subTag: Tag = labels.find((el: Tag) => {
        return el.name === branch[0];
      });
      if (subTag === undefined) {
        return false;
      }

      branch.shift();
      if (branch.length === 0) {
        return true;
      }
      return getters.labelBranchExists(branch, subTag.subTags);
    },
    getRoutineById: (state: any) => (key: string): string => {
      return state.routine.routines.find((el: Routine) => {
        return el.id === key;
      });
    },
    parseArrayNodeToString: (state: any) => (node: string[]): string => {
      const length = node.length;
      let str = '';
      for (let i = 0; i < length; i++) {
        str += node[i];
        if (i + 1 !== length) {
          str += ':';
        }
      }
      return str;
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
        // localStorage.setItem('watchrRoutines', JSON.stringify(
        //   state.routine,
        // ));
      }
    },
    saveIntervals(state: any) {
      if (state.webStorage) {
        // localStorage.setItem('watchrIntervals', JSON.stringify(
        //   state.interval,
        // ));
      }
    },
    saveTags(state: any) {
      if (state.webStorage) {
        // localStorage.setItem('watchrTags', JSON.stringify(
        //   state.tags,
        // ));
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
    addInterval({ state, commit }: any, interval: Interval) {
      state.intervals.push(interval);
      commit('saveIntervals');
    },
    deleteLabelById({ state, commit, dispatch }: any, {id, labels}: any) {
      if (labels === undefined) {
        labels = state.tags.labels;
      }

      const index = labels.findIndex((el: Tag) => {
        return el.id === id;
      });

      if (index === -1) {
        const length = labels.length;
        for (let i = 0; i < length; i++) {
         dispatch('deleteLabelById', {id, labels: labels[i].subTags})
        }
      } else {
        labels.splice(index, 1);
        commit('saveTags');
      }
    },
    addLabelNode({ state, dispatch, getters }: any, {node, labels, originalNode}: any) {
      if (labels === undefined) {
        labels = state.tags.labels;
      }
      if (originalNode === undefined) {
        originalNode = node.slice();
      }

      if (node.length > 1) {
        const subLabel: Tag = labels.find((el: Tag) => {
          return el.name === node[0];
        });
        node.shift();
        dispatch('addLabelNode', { node , labels: subLabel.subTags, originalNode});
      } else {
        labels.push({
          type: 'Label',
          name: node[0],
          id: uuid.v4(),
          subTags: [],
        } as Tag);
        ToastBus.$emit('addToast', {

          msg: `Added <strong>'${getters.parseArrayNodeToString(originalNode)}' </strong> label successfuly`,
          duration_seconds: 2.5,
          type: 'success',
        } as ToastObj);
      }
    },
    addLabelBranch({ commit, state, dispatch, getters }: any, values: string[]) {
      const length = values.length;

      for (let i = 0;i < length; i++) {
        const splice = values.slice();
        splice.splice(i + 1);

        if (!getters.labelBranchExists(splice.slice())) {
          dispatch('addLabelNode', { node: splice.slice()});
        } else if (i + 1 === length) {
          ToastBus.$emit('addToast', {
            msg: `Label ${values[values.length - 1]} already exists.`,
            duration_seconds: 4,
            type: 'error',
          });
        }
      }
      commit('saveTags');
    },
  },
};
