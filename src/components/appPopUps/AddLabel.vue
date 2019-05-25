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
        <alert type='error'>{{ errorMsg }}</alert>
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
import Title from '@/components/generalComponents/Heading.vue';
import Input from '@/components/appComponents/Input.vue';
import Button from '@/components/generalComponents/Button.vue';
import Alert from '@/components/generalComponents/Alert.vue';
import Heading from '@/components/appComponents/Heading.vue';

import { Tag } from '@/components/interfaces';

import mixin from 'vue-typed-mixins';
import { app } from '@/components/mixins';

export default mixin(app).extend({
  mixins: [app as any],
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
      errorMsg: '',
    };
  },
  methods: {
    valueChange(value: string) {
      this.value = value;
      this.errorMsg = '';
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
        const values = value.split(':');
        const exists = this.$store.getters['app/labelExists'](value);
        if (!exists && values.length === 1) {
          this.$store.dispatch('app/addLabel', {
            id: this.createId(),
            type: 'Label',
            name: value,
          } as Tag);
        } else {
          this.errorMsg = 'Duplicate label name.';
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
