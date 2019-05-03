<template>
  <div class='input form-element'>
    <div>
      <div>
        <input class='input' :class='[wrongInput, $store.state.style]' :name='name' :placeholder='placeholder' :type='inputType' autocomplete='off' v-model='value'/>
        <icon class='pointer' @click='togglePassword' v-show='isPassword && visiblePassword' sz='medium' ico='eye'></icon>
        <icon class='pointer' @click='togglePassword' v-show='isPassword && !visiblePassword' sz='medium' ico='eye-slash'></icon>
      </div>
      <alert type='error' v-show='errorType === "emptyValue"'>This field cannot be empty.</alert>
      <alert type='error' v-show='errorType === "reachedMaxCharacters"'>Reached maximum number of characters.</alert>
      <alert type='error' v-show='errorType === "errorMsg"'>{{ this.error }}</alert>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import Alert from './../generalComponents/Alert.vue';
import Icon from './../generalComponents/Icon.vue';

import { FormBus } from './Form.vue';
import { FormLogObject, InputErrorObject } from './../interfaces';


export default Vue.extend({
  components: {
    alert: Alert,
    icon: Icon,
  },
  props: {
    name: String,
    placeholder: String,
    max: Number,
    type: String,
    busEvent: String,
  },
  data() {
    return {
      value: undefined,
      errorType: null as any,
      inputType: this.type as string,
      error: '' as string,
      visiblePassword: false as boolean,
      eventName: undefined as any,
    };
  },
  created() {
    if (this.busEvent) {
      this.eventName = this.busEvent;
    } else {
      this.eventName = 'errorLog';
    }

    FormBus.$emit(this.eventName, {
      name: this.name,
      value: undefined,
      error: true,
    } as FormLogObject);
    FormBus.$on('error', (obj: InputErrorObject) => {
      if (obj.name === this.name) {
        this.errorType = 'errorMsg';
        this.error = obj.msg;
      }
    });
  },
  methods: {
    togglePassword(): void {
      this.visiblePassword = !this.visiblePassword;
      if (this.visiblePassword) {
        this.inputType = 'text';
      } else {
        this.inputType = 'password';
      }
    },
  },
  computed: {
    logObject(): object {
      const val: any = this.value;
      let hasError: boolean = false;
      if (val === '') {
        this.errorType = 'emptyValue';
        hasError = true;
      } else if (val.length > this.max) {
        this.errorType = 'reachedMaxCharacters';
        hasError = true;
      } else {
        this.errorType = null;
      }

      return {
        name: this.name,
        value: this.value,
        error: hasError,
      };
    },
    wrongInput(): object {
      return [
        (this.errorType === null) ? '' : 'wrong-input ' + this.$store.state.style,
      ];
    },
    isPassword(): boolean {
      return (this.type === 'password');
    },
  },
  watch: {
    value(): void {
      FormBus.$emit(this.eventName, this.logObject);
    },
  },
  beforeDestroy() {
    FormBus.$off('error');
  },
});
</script>

<style scoped>

input {
  box-sizing: border-box;
  width: 100%;
}

div.form-margin {
  margin: 4px 0;
}

div.input > div {
  width: 90%;
  margin: auto;
}

div.input > div > div {
  position: relative;
}

i.icon {
  position: absolute;
  top: 8px;
  right: 8px;
}

@media screen and (max-width: 801px) {
  div.input > div {
    width: 90%;
  }
}

</style>
