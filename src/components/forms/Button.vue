<template>
  <div class='form-button form-element'>
    <btn :type='type'><slot></slot></btn>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
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

</style>

