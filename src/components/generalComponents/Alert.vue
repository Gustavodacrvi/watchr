<template>
  <span :class='$store.getters.style("span-alert-" + type)'>
    <slot></slot>
  </span>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  props: {
    type: String,
  },
});
</script>

