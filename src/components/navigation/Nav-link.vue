<template>
  <div :class='[classObject, $store.state.theme.style]' @click='$emit("click", to)'>
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
    value: String,
  },
  computed: {
    isActive(): boolean {
      return (this.$route.path === this.to);
    },
    classObject(): object {
      return [
        true ? 'nav-link' : '',
        this.isActive ? 'active-nav-link' : '',
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

a {
  display: inline-block;
  padding: 0 12px;
  margin: 0 4px;
  text-decoration: none;
  transition-duration: .1s;
}

div.nav-link:hover > a, .active-nav-link > a {
  color: #FE684F;
}

</style>
