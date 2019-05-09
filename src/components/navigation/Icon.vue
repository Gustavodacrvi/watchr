<template>
  <div id='hamburger-icon'>
    <span class='line'></span>
    <span class='line'></span>
    <span class='line'></span>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
});
</script>


<style scoped>

#hamburger-icon {
  display: inline-block;
  width: 32px !important;
  height: 28px !important;
  position: relative;
  cursor: pointer;
}

.line {
  position: absolute;
  height: 5px;
  border-radius: 1px;
  background-color: #ADADAD;
}

#hamburger-icon > :nth-child(1) {
  top: 0;
  width: 100%;
}

#hamburger-icon > :nth-child(3) {
  bottom: 0;
  width: 100%;
}

#hamburger-icon > :nth-child(2) {
  width: 22px;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

</style>

