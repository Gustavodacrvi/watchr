<template>
  <button class='button' :class='$store.state.style' @click='$emit("click")' :type='type'><slot></slot></button>
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

</style>

