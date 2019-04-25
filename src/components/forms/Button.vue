<template>
  <div class='form-button form-element'>
    <btn :type='type' @click='sendButtonEvent'><slot></slot></btn>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import Button from './../generalComponents/Button.vue';
import { FormBus } from './Form.vue';

export default Vue.extend({
  components: {
    btn: Button,
  },
  props: {
    type: String,
  },
  methods: {
    sendButtonEvent() {
      FormBus.$emit('submit');
    },
  },
});
</script>

<style scoped>

div.form-button {
  display: flex;
  justify-content: center;
}

div.form-button button {
  width: 90%;
}

</style>

