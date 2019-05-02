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
  font-size: 1.15em;
}

div:hover {
  cursor: pointer;
}

a {
  display: inline-block;
  padding: 0 12px 16px 12px;
  margin: 0 6px;
  text-decoration: none;
  transition-duration: .1s;
}

</style>
