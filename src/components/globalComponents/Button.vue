<template>
  <button :class='$store.getters.style("button")' @click='$emit("click")' :type='type'><slot></slot></button>
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

