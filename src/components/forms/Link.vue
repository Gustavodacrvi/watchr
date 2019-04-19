<template>
  <div class='form-link form-element'>
    <route :to='to'><slot></slot></route>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

Vue.directive('margin-left', {
  bind(el, binding) {
    const a: any = el.firstChild;

    a.style.marginLeft = binding.value;
  },
});

export default Vue.extend({
  props: {
    to: String,
  },
});
</script>

<style scoped>


</style>
