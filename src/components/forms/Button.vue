<template>
  <div class='form-button form-element'>
    <btn :type='type'><slot></slot></btn>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import Button from './../generalComponents/Button.vue';

export default Vue.extend({
  components: {
    btn: Button,
  },
  props: {
    type: String,
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

