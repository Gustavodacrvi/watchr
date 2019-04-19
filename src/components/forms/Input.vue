<template>
  <div class='input'>
    <div>
      <div>
        <input :class='[wrongInput, $store.getters.style("input")]' :name='name' :placeholder='placeholder' :type='type' autocomplete='off' v-model='value'/>
        <i class='fa fa-bars'></i>
      </div>
      <alert type='error' v-if='errorType === "emptyValue"'>This field cannot be empty.</alert>
      <alert type='error' v-if='errorType === "reachedMaxCharacters"'>Reached maximum number of characters.</alert>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Alert from './../Alert.vue';

import { bus } from './Form.vue';

export default Vue.extend({
  components: {
    alert: Alert,
  },
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
    };
  },
  created() {
    bus.$emit('errorLog', {
      name: this.name,
      value: undefined,
      error: true,
    });
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

div.input > div {
  width: 85%;
  margin: auto;
  margin-bottom: 15px;
}

</style>
