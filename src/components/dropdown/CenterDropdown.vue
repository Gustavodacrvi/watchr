<template>
  <span class='dropdown' @mouseenter='show = !show' @mouseleave='show = !show'>
    <slot name='handle'></slot>
    <div class='card' :class='$store.state.style' v-if='show'>
      <slot name='content'></slot>
    </div>
  </span>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  props: {
    handle: Vue,
  },
  data() {
    return {
      show: false,
    };
  },
});
</script>

<style scoped>

.dropdown {
  position: relative;
}

.dropdown > div {
  position: absolute;
  top: 100%;
}

</style>
