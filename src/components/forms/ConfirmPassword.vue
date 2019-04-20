<template>
  <div class='confirm-password'>
    <app-input :class='inputClass' name='password' :placeholder='placeholder1' :max='max' type='password' :bus-event='busEvent'></app-input>
    <app-input :class='inputClass' name='confirm' :placeholder='placeholder2' :max='max' type='password' :bus-event='busEvent'></app-input>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import Input from './Input.vue';
import { bus } from './Form.vue';
import { LogObject, ErrorObject } from './interfaces';

export default Vue.extend({
  components: {
    'app-input': Input,
  },
  props: {
    name: String,
    max: Number,
    placeholder1: String,
    placeholder2: String,
    inputClass: String,
  },
  data() {
    return {
      password: undefined as any,
      confirm: undefined as any,
      busEvent: 'ConfirmPassword',
    };
  },
  created() {
    bus.$on(this.busEvent, (obj: LogObject) => {
      if (obj.name === 'password') {
        this.password = obj.value;
      } else {
        this.confirm = obj.value;
      }

      if (this.wrongInputs()) {
        bus.$emit('error', {
          name: 'confirm',
          msg: 'Passwords not matching.',
        } as ErrorObject);
      }
    });
  },
  methods: {
    wrongInputs(): boolean {
      if (this.password !== undefined && this.confirm !== undefined) {
        if (this.password !== this.confirm) {
          return true;
        }
        return false;
      }
      return false;
    },
  },
});
</script>

<style scoped>

div.confirm-password {
  display: flex;
  flex-direction: column;
}

</style>
