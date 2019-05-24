<template>
  <span @click='$emit("click")' class='alert' :class='["span-alert-" + type,$store.state.theme.style]'>
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

.pointer {
  cursor: pointer;
}

.pointer:hover {
  text-decoration: underline;
}

.span-alert-error {
  color: #ec554d;
}

</style>

