<template>
  <div>
    <span>
      <slot></slot>
    </span>
  </div>
</template>

<script lang='ts'>
import Vue from 'vue';
export default Vue.extend({
});
</script>

<style scoped>

div {
  position: relative;
  display: inline-block;
  height: 43px;
}

div:hover {
  cursor: pointer;
}

span {
  display: inline-block;
  padding: 12px;
  transition-duration: .2;
}

div:hover > span {
  color: #30e8e2;
}

</style>
