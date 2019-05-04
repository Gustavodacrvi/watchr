<template>
  <span class='dropdown' @mouseenter='show = !show' @mouseleave='show = !show'>
    <slot name='handle'></slot>
    <div class='card-round' :class='$store.state.style' v-if='show'>
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
  display: inline-flex;
  justify-content: center;
}

.dropdown > div {
  position: absolute;
  top: 115%;
  display: inline-block;
}


.text-align {
  text-align: center;
}

</style>
