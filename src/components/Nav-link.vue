<template>
  <div>
    <router-link :to='to'>
      <slot></slot>
    </router-link>
  </div>
</template>

<script lang='ts'>
import Vue from 'vue';
export default Vue.extend({
  props: ['to'],
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

a {
  display: inline-block;
  padding: 12px;
  text-decoration: none;
  transition-duration: .2;
}

div:hover > a {
  color: #30e8e2;
}

</style>
