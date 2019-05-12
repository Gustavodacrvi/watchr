<template>
  <div class='mobile-link' :class='{"active-link": isActive}' @click='$emit("click")'>
    <router-link class='router-link' :to='to'>
      <slot></slot>
    </router-link>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  props: {
    to: String,
  },
  computed: {
    isActive(): boolean {
      return (this.$route.path === this.to);
    },
  },
});
</script>

<style scoped>

.mobile-link {
  padding: 3px;
}

.active-link .router-link {
  color: #F4F2F1;
  position: relative;
}

.active-link .router-link::before {
  content: '';
  position: absolute;
  width: 100%;
  background-color: #F4F2F1;
  bottom: -4px;
  height: 3px;
}

.router-link {
  text-decoration: none;
  font-size: 1.25em;
}

.router-link:hover {
  color: #F4F2F1;
}

</style>
