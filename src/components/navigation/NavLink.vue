<template>
  <div class='nav-link' :class='[classObject, $store.state.theme.style]' @click='$emit("click", to)'>
    <router-link class='router-link' :to='to'>
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

.nav-link {
  position: relative;
  white-space: nowrap;
  height: 100%;
  font-size: 1.15em;
}

.router-link {
  float: left;
  padding: 0 12px;
  margin: 0 4px;
  text-decoration: none;
  transition-duration: .1s;
}

.nav-link:hover .router-link, .active-nav-link .router-link {
  color: #A97CFC;
  text-shadow: 0 0 1px #A97CFC;
}

</style>
