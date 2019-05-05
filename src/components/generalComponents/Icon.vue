<template>
  <i class='icon' :class='`fa fa-${ico} ${sz} icon ` + $store.state.style' @click='$emit("click")'></i>  
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

