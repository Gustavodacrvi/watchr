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
  background-color: #A97CFC;
  box-shadow: 0 1px 3px rgb(169, 124, 252, .4);
  font-size: 1.05em;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0,0,0,0);
  -webkit-tap-highlight-color: transparent;
  transition-duration: .2s;
  outline: none;
  font-family: 'Work Sans';
  top: 0;
}

.button span, .button i {
  color: #fff;
}

.button:hover {
  background-color: #bd9bfd;
  box-shadow: 0 1px 4px #A97CFC;
}

.tiny {
  padding: 8px;
  font-size: 0.9em;
  border-radius: 12px;
}

.tiny-round {
  border-radius: 100px;
}

</style>

