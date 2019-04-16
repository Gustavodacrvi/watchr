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
  position: absolute;
  height: 100%;

  display: flex;
  align-items: center;
}

span {
  padding: 9px;
}

</style>
