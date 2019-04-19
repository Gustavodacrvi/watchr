<template>
  <div class='input form-element'>
    <div>
      <div>
        <input :class='[wrongInput, $store.getters.style("input")]' :name='name' :placeholder='placeholder' :type='inputType' autocomplete='off' v-model='value'/>
        <icon @click='togglePassword' v-show='isPassword && visiblePassword' sz='medium' ico='eye' v-cursor></icon>
        <icon @click='togglePassword' v-show='isPassword && !visiblePassword' sz='medium' ico='eye-slash' v-cursor></icon>
      </div>
      <alert type='error' v-show='errorType === "emptyValue"'>This field cannot be empty.</alert>
      <alert type='error' v-show='errorType === "reachedMaxCharacters"'>Reached maximum number of characters.</alert>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import { bus } from './Form.vue';

export default Vue.extend({
  props: {
    name: String,
    placeholder: String,
    max: Number,
    type: String,
  },
  data() {
    return {
      value: undefined,
      errorType: null as any,
      inputType: this.type as string,
      visiblePassword: false as boolean,
    };
  },
  created() {
    bus.$emit('errorLog', {
      name: this.name,
      value: undefined,
      error: true,
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
        (this.errorType === null) ? '' : this.$store.getters.style('wrong-input'),
      ];
    },
    isPassword(): boolean {
      return (this.type === 'password');
    },
  },
  watch: {
    value(): void {
      bus.$emit('errorLog', this.logObject);
    },
  },
});
</script>

<style scoped>

input {
  box-sizing: border-box;
  width: 100%;
}

div.form-margin {
  margin: 2px 0;
}

div.input > div {
  width: 85%;
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
