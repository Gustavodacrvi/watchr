<template>
  <div class='card-round pop-up' :class='$store.state.theme.style'>
    <div class='title'>
      <app-title :lvl='3'>Add label</app-title>
    </div>
    <div class='input'>
      <div class='wrapper'>
        <heading :simple='true' title='Help' :showing='false'>
          <span>You can create sub-labels using <span class='big'>:</span> .<br/><br/>
          E.g: family:spouse, work:people:karen, work:office.<br/><br/>The outer tag is automatically created if not present.</span>
        </heading>
        <app-input tabindex='1' class='stretch' :max='80' @value-change='valueChange' @state-change='updateState' @enter='add' placeholder='E.g: 5 minutes, full focus, brain dead...'></app-input>
        <div class='options'>
          <btn class='medium' @click='add'>Add label</btn>
          <alert class='pointer' type='error' @click='$store.commit("app/nav/hidePopUp")'>Cancel</alert>
          <span class='right'>Press <strong>A + L</strong> to open this pop up.</span>
          <span class='right'>Press <strong>CTRL + C</strong> to close any pop up</span>
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
      result: undefined as any,
      value: '',
    };
  },
  methods: {
    valueChange(value: string) {
      this.value = value;
    },
    updateState(state: any) {
      this.validInput = !state.wrong;
    },
    add() {
      if (this.validInput) {
        let value = this.value.trim();
        if (value[value.length - 1] === ':') {
          value = value.slice(0, -1);
        }
        let values = value.split(':');
        const length = values.length;
        for (let i = 0; i < length; i++) {
          values[i] = values[i].trim();
        }

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
