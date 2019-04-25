<template>
  <div class='confirm-password'>
    <app-input :class='inputClass' name='password' :placeholder='placeholder1' :max='max' type='password' bus-event='ConfirmPassword'></app-input>
    <app-input :class='inputClass' name='confirm' :placeholder='placeholder2' :max='max' type='password' bus-event='ConfirmPassword'></app-input>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import Input from './Input.vue';
import { FormBus } from './Form.vue';
import { InputErrorObject, FormLogObject } from './../interfaces';

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
    };
  },
  created() {
    FormBus.$on('ConfirmPassword', (obj: InputErrorObject) => {
      if (obj.name === 'password') {
        this.password = obj;
      } else {
        this.confirm = obj;
      }
      const errorObj = {
        name: this.name,
        value: this.password.value,
        error: false,
      } as FormLogObject;

      if (this.passwordsNotMatching()) {
        FormBus.$emit('error', {
          name: 'confirm',
          msg: 'Passwords not matching.',
        } as InputErrorObject);
        errorObj.error = true;

        FormBus.$emit('errorLog', errorObj);
      } else {
        errorObj.error = this.password.error || this.confirm.error;

        FormBus.$emit('errorLog', errorObj);
      }
    });

    FormBus.$emit('errorLog', {
      name: this.name,
      value: undefined,
      error: true,
    } as FormLogObject);
  },
  methods: {
    passwordsNotMatching(): boolean {
      if (this.password.value !== undefined && this.confirm.value !== undefined) {
        if (this.password.value !== this.confirm.value) {
          return true;
        }
        return false;
      }
      return false;
    },
    hasError(): boolean {
      return (this.password.error || this.confirm.error);
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
