<template>
  <i :class='"fa fa-" + ico + " " + sz + " icon " + $store.getters.style("icon")' @click='$emit("click")'></i>  
</template>

<script lang="ts">
import Vue from 'vue';

Vue.directive('cursor', {
  bind(el, binding) {
    el.classList.add('pointer');
  },
});

export default Vue.extend({
  props: {
    sz: String,
    ico: String,
  },
});
</script>

<style scoped>

i.icon-light {
  font-size: 20px;
}

i.pointer {
  cursor: pointer;
}

</style>

