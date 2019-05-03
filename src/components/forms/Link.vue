<template>
  <div class='form-link form-element'>
    <route :to='to'><slot></slot></route>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import Route from './../generalComponents/Link.vue';

Vue.directive('margin-left', {
  bind(el, binding) {
    const a: any = el.firstChild;

    a.style.marginLeft = binding.value;
  },
});

export default Vue.extend({
  components: {
    route: Route,
  },
  props: {
    to: String,
  },
});
</script>
