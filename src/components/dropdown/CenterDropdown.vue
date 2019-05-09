<template>
  <span class='dropdown' @mouseenter='show = !show' @mouseleave='show = !show'>
    <slot name='handle'></slot>
    <transition name='fade-transition'>
    <div class='card-round' :class='$store.state.theme.style' v-if='show'>
      <slot name='content'></slot>
    </div>
    </transition>
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
  display: inline-flex;
  justify-content: center;
  z-index: 1;
}

.dropdown-text-element:hover > span {
  color: #FE684F;
}


.dropdown > div {
  position: absolute;
  top: 100%;
  display: inline-block;
}


.text-align {
  text-align: center;
}

</style>
