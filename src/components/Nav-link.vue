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
  border-bottom: 2px solid #ac6ea5;
}

div:hover > span {
  color: #ac6ea5;
}

span {
  display: inline-block;
  margin-top: 3px;
  padding: 9px;
  font-size: 1.1em;
  transition-duration: .2;
}

</style>
