<template>
  <button class='button' :class='$store.state.theme.style' @click='$emit("click")' :type='type'><slot></slot></button>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  props: {
    type: String,
  },
});
</script>

<style scoped>

.button {
  position: relative;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  color: #fff;
  background-color: #FE684F;
  font-size: 1.05em;
  cursor: pointer;
  transition-duration: .2s;
  outline: none;
  font-family: 'Work Sans';
  top: 0;
}

.button span, .button i {
  color: #fff;
}

.button:hover {
  background-color: #fe7367;
}


</style>

