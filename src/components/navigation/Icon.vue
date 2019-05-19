<template>
  <div id='hamburger-icon' :class='[{"active": active}, position]' @click='$emit("toggle")'>
    <span class='line' id='hamburger-icon-top'></span>
    <span class='line' id='hamburger-icon-middle'></span>
    <span class='line' id='hamburger-icon-bottom'></span>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  props: {
    position: String,
    active: Boolean,
    toggle: Function,
  },
});
</script>


<style scoped>

#hamburger-icon {
  position: relative;
  right: 0;
  left: 0;
  top: 0;
  bottom: 0;
  display: inline-block;
  width: 32px !important;
  height: 28px !important;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0,0,0,0);
  -webkit-tap-highlight-color: transparent;
  transition-duration: .3s;
}

.line {
  position: absolute;
  height: 5px;
  border-radius: 1.5px;
  background-color: #ADADAD;
  transition-duration: .2s;
}

#hamburger-icon:hover .line {
  background-color: #A97CFC !important;
}

#hamburger-icon-top {
  top: 0;
  width: 100%;
  left: 0;
}

#hamburger-icon-bottom {
  bottom: 0;
  width: 100%;
  left: 0;
}

#hamburger-icon-middle {
  width: 22px;
  top: 50%;
  transform: translateY(-50%);
}

#hamburger-icon.right #hamburger-icon-middle {
  right: 0;
}

.active #hamburger-icon-middle {
  width: 0;
}

.active #hamburger-icon-top {
  top: 42% !important;
  left: -3px !important;
  width: 32px !important;
  transform: rotate(50deg);
}

.active #hamburger-icon-bottom {
  bottom: 40% !important;
  left: -3px !important;
  width: 32px !important;
  transform: rotate(-50deg);
}

.active #hamburger-icon-middle {
  width: 0 !important;
  left: 50% !important;
}

</style>

