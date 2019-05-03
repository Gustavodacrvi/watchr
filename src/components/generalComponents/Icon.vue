<template>
  <i class='icon' :class='`fa fa-${ico} ${sz} icon ` + $store.state.style' @click='$emit("click")'></i>  
</template>

<script lang="ts">
import Vue from 'vue';

Vue.directive('cursor', {
  bind(el, binding) {
    el.classList.add('pointer');
  },
});

Vue.directive('color-hover', {
  bind(el, binding) {
    el.classList.add('icon-color-hover');
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

i.icon {
  font-size: 18px;
}

i.pointer {
  cursor: pointer;
}

i.big {
  font-size: 25px;
}

i.massive {
  font-size: 100px;
}

</style>

