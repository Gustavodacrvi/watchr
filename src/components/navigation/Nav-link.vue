<template>
  <div :class='classObject'>
    <router-link :to='to'>
      <slot></slot>
    </router-link>
  </div>
</template>

<script lang='ts'>
import Vue from 'vue';
import router from '../../router';
export default Vue.extend({
  props: {
    to: String,
  },
  computed: {
    isActive(): boolean {
      return (this.$route.path === this.to);
    },
    classObject(): object {
      return [
        true ? this.$store.getters.style('nav-link') : '',
        this.isActive ? this.$store.getters.style('active-nav-link') : '',
      ];
    },
  },
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
