<template>
  <span :class='["span-alert-" + type,$store.state.theme.style]'>
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

<style scoped>

.span-alert-error {
  color: #ecec4b;
}

</style>

