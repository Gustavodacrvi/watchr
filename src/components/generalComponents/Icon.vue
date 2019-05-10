<template>
  <i class='icon' :class='`fa fa-${ico} ${sz} icon ` + $store.state.theme.style' @click='$emit("click")'></i>  
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  props: {
    sz: String,
    ico: String,
  },
});
</script>

<style scoped>

.medium {
  font-size: 18px;
}

.big {
  font-size: 24px;
}

.massive {
  font-size: 100px;
}

.pointer {
  cursor: pointer;
}

.icon {
  color: #ADADAD;
}

.icon-main-color {
  color: #FE684F;
}

.icon-color-hover {
  transition-duration: .2s;
}

.icon-color-hover:hover {
  color: #FE684F;
}

</style>
