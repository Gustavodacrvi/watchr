<template>
  <i class='icon' :class='`fa fa-${ico} ${sz} icon ` + $store.state.theme.style' @click='$emit("click")' @mouseover='$emit("mouseover")' @mouseleave='$emit("mouseleave")'></i>  
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

.big-big {
  font-size: 26px;
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

.color {
  color: #A97CFC;
}

.icon-main-color {
  color: #A97CFC;
}

.icon-color-hover {
  transition-duration: .2s;
}

.icon-color-hover:hover {
  color: #A97CFC;
  text-shadow: 0 0 2px #A97CFC;
}

</style>
