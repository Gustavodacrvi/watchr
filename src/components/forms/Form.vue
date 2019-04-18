<template>
  <div :class='$store.getters.style("card-round")' class='form'>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

Vue.directive('column', {
  bind(el, binding) {
    el.style.display = 'flex';
    el.style.flexDirection = 'column';
  },
});

export default Vue.extend({
});
</script>

<style scoped>

div.form {
  width: 100%;
}

</style>
