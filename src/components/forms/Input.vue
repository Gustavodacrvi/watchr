<template>
  <div class='input'>
    <div>
      <input class='input' :name='name' :placeholder='placeholder' :type='type' autocomplete='off' v-model='value'/>
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
      }

      return {
        name: this.name,
        value: this.value,
        error: hasError,
      };
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

div.input {
  display: flex;
  justify-content: center;
}

div.input > div {
  width: 85%;
  margin-bottom: 15px;
}

</style>
