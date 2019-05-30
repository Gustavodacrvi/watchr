import uuid from 'uuid';

import { Tag, ToastObj } from '@/components/interfaces';
// this error doesn't make sense, just leave it there
import { ToastBus } from '@/components/regular/Toast.vue';


export default {
  namespaced: true,
  state: {
    tags: {
      labels: [] as Tag[],
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
    parseArrayBranchToStringBranch: (state: any) => (branch: string[]): string => {
      const length = branch.length;
      let str = '';
      for (let i = 0; i < length; i++) {
        str += branch[i];
        if (i + 1 !== length) {
          str += ':';
        }
      }
      return str;
    },
    parseStringBranchToArrayBranch: (state: any) => (branch: string, acceptLastTwoDots: boolean): string[] => {
      let value = branch.trim();
      if (!acceptLastTwoDots && value[value.length - 1] === ':') {
        value = value.slice(0, -1);
      }
      const values = value.split(':');
      const length = values.length;
      for (let i = 0; i < length; i++) {
        values[i] = values[i].trim();
      }

      return values;
    },
    getLabelArrayBranchByNodeId:
     (state: any, getters: any) => (id: string, branch: any, labels: any): string[] | undefined => {
      if (labels === undefined) {
        labels = state.tags.labels;
      }
      if (branch === undefined) {
        branch = [];
      }

      const length = labels.length;
      for (let i = 0; i < length; i++) {
        const returnBranch = branch.slice();
        returnBranch.push(labels[i].name);
        if (labels[i].id === id) {
          return returnBranch;
        }
        const targetBranch = getters.getLabelArrayBranchByNodeId(id, returnBranch, labels[i].subTags);
        if (targetBranch !== undefined) {
          return targetBranch;
        }
      }
      return undefined;
    },
    getSubTagsFromBranchSearch: (state: any, getters: any) => (branch: string[], labels: any): string[] => {
      if (labels === undefined) {
        labels = state.tags.labels;
      }

      if (branch.length === 1) {
        return labels.filter((label: Tag) => {
          return label.name.match(branch[0]);
        });
      } else {
        const label = labels.find((el: Tag) => {
          return el.name === branch[0];
        });
        if (label === undefined) {
          return [];
        }
        branch.shift();
        return getters.getSubTagsFromBranchSearch(branch, label.subTags);
      }
    },
  },
  mutations: {
    saveTags(state: any) {
      if (state.webStorage) {
        // localStorage.setItem('watchrTags', JSON.stringify(
        //   state.tags,
        // ));
      }
    },
  },
  actions: {
    deleteLabelNodeById({ state, commit, dispatch, getters }: any, {id, labels}: any) {
      if (labels === undefined) {
        labels = state.tags.labels;
      }

      const index = labels.findIndex((el: Tag) => {
        return el.id === id;
      });

      if (index === -1) {
        const length = labels.length;
        for (let i = 0; i < length; i++) {
         dispatch('deleteLabelNodeById', {id, labels: labels[i].subTags});
        }
      } else {
        ToastBus.$emit('addToast', {
          msg: `Deleted <strong>'${getters.parseArrayBranchToStringBranch(getters.getLabelArrayBranchByNodeId(id))}'
          </strong> label and all of its sub tags successfuly.`,
          duration_seconds: 3,
          type: 'success',
        } as ToastObj);
        labels.splice(index, 1);
        commit('saveTags');
      }
    },
    addLabelNode({ state, dispatch, getters }: any, {branch, labels, originalBranch}: any) {
      if (labels === undefined) {
        labels = state.tags.labels;
      }
      if (originalBranch === undefined) {
        originalBranch = branch.slice();
      }

      if (branch.length > 1) {
        const subLabel: Tag = labels.find((el: Tag) => {
          return el.name === branch[0];
        });
        branch.shift();
        dispatch('addLabelNode', { branch , labels: subLabel.subTags, originalBranch});
      } else {
        labels.push({
          type: 'Label',
          name: branch[0],
          id: uuid.v4(),
          subTags: [],
        } as Tag);
        ToastBus.$emit('addToast', {

          msg: `Added <strong>'${getters.parseArrayBranchToStringBranch(originalBranch)}' </strong> label successfuly`,
          duration_seconds: 2,
          type: 'success',
        } as ToastObj);
      }
    },
    addLabelBranch({ commit, state, dispatch, getters }: any, branch: string[]) {
      const length = branch.length;

      for (let i = 0; i < length; i++) {
        const splice = branch.slice();
        splice.splice(i + 1);

        if (!getters.labelBranchExists(splice.slice())) {
          dispatch('addLabelNode', { branch: splice.slice()});
        } else if (i + 1 === length) {
          ToastBus.$emit('addToast', {
            msg: `Label <strong>'${getters.parseArrayBranchToStringBranch(splice.slice())}'</strong> already exists.`,
            duration_seconds: 4,
            type: 'error',
          });
        }
      }
      commit('saveTags');
    },
  },
};
