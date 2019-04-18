<template>
  <div class='nav-link'>
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
  height: 100%;
}

div:hover {
  cursor: pointer;
}

a {
  display: inline-block;
  padding: 12px 3px;
  margin: 2px 5px;
  text-decoration: none;
  transition-duration: .1s;
}

</style>
