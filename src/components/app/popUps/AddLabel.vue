<template>
  <div class='pop-up' :class='$store.state.theme.style'>
    <div class='title'>
      <app-title :lvl='3'>Add label</app-title>
    </div>
    <div class='input'>
      <div class='wrapper'>
        <heading :simple='true' title='Help' :showing='false'>
          <span>You can create sub-labels using <span class='big'>:</span> .<br/><br/>
          E.g: family:spouse, work:people:karen, work:office.<br/><br/>The outer tag is automatically created if not present.</span>
        </heading>
        <app-input tabindex='1' class='stretch' :max='80' :options='subTagNames' :input='value' @value-change='valueChange' @state-change='updateState' @enter='add' @select='selectString' placeholder='E.g: 5 minutes, full focus, brain dead...'></app-input>
        <div class='options'>
          <btn tabindex='2' class='medium' @click='add'>Add label</btn>
          <alert class='pointer' type='error' @click='$store.commit("app/nav/hidePopUp")'>Cancel</alert>
          <template v-if='$store.state.NavbarisOnDesktop'>
            <span class='right'>Press <strong>A + L</strong> to open this pop up.</span>
            <span class='right'>Press <strong>H + H</strong> to close any pop up</span>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Title from '@/components/regular/Heading.vue';
import Input from '@/components/app/components/Input.vue';
import Button from '@/components/regular/Button.vue';
import Alert from '@/components/regular/Alert.vue';
import Heading from '@/components/app/components/Heading.vue';

import { ToastBus } from '@/components/regular/Toast.vue';

import { Tag } from '@/components/interfaces';

export default Vue.extend({
  components: {
    'app-title': Title,
    'app-input': Input,
    'btn': Button,
    'alert': Alert,
    'heading': Heading,
  },
  data() {
    return {
      validInput: false as boolean,
      value: '',
      subTags: [] as any[],
    };
  },
  methods: {
    selectString(selected: string) {
      const arr = this.getValuesArray(true);
      if (arr.length > 0) {
        arr[arr.length - 1] = selected;
      } else {
        arr.push(selected);
      }
      const length = arr.length;
      let value = '';
      for (let i = 0; i < length; i++) {
        value += arr[i];
        if (i + 1 !== length) {
          value += ':';
        }
      }
      this.value = value;
    },
    valueChange(value: string) {
      this.value = value;
      const values = this.getValuesArray(true);
      this.subTags = this.$store.getters['app/tag/getSubTagsFromBranchSearch'](values);
    },
    updateState(state: any) {
      this.validInput = !state.wrong;
    },
    getValuesArray(acceptLastTwoDots: boolean): string[] {
      let value = this.value.trim();
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
    add() {
      if (this.validInput) {
        const values = this.getValuesArray(false);

        if (values.length > 4) {
          ToastBus.$emit('addToast', {
            msg: `Subtags can only go to 4 sublevels`,
            duration_seconds: 4,
            type: 'error',
          });
        } else {
          this.$store.dispatch('app/tag/addLabelBranch', values);
        }
      }
    },
  },
  computed: {
    subTagNames(): string[] {
      const length = this.subTags.length;
      const arr = [];
      for (let i = 0; i < length; i++) {
        arr.push(this.subTags[i].name);
      }
      return arr;
    },
  },
});
</script>

<style scoped>

.title {
  text-align: center;
}

.pop-up {
  flex-basis: 700px;
  padding: 0 18px;
  padding-bottom: 18px;
}

.wrapper {
  display: flex;
  justify-content: center;
  flex-direction: column;
}

.options{
  margin-top: 10px;
}

.alert {
  margin: 8px;
}

.big {
  font-size: 1.5em;
}

.right {
  float: right;
  clear: right;
}

</style>
