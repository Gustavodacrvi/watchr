<template>
  <div class='input'>
    <div>
      <input class='input' :name='name' :placeholder='placeholder' :type='type' autocomplete='off' v-model='value'/>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import { 
  LogObject,
  ComponentComputed,
  ComponentMethods,
} from './formInterfaces';

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
      value: '',
    }
  },
  created() {
    this.commitLog();
  },
  methods: {
    hasErrors(): boolean {
      if (this.reachedMaximumCharacters() || this.isEmpty()) {
        return true;
      }
      return false;
    },
    reachedMaximumCharacters(): boolean {
      return (this.value.length > this.max);
    },
    isEmpty(): boolean {
      return (this.value.length === 0);
    },
    commitLog(): void {
      bus.$emit('errorLog', this.logObject);
    },
  } as ComponentMethods,
  computed: {
    logObject(): LogObject {
      return {
        name: this.name,
        value: this.value,
        error: this.hasErrors(),
      };
    },
  } as ComponentComputed,
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
