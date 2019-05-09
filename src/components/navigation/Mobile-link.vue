<template>
  <div class='mobile-link' :class='{"active-link": isActive}' @click='$emit("click")'>
    <router-link :to='to'>
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

.active-link a {
  color: #FE684F;
  position: relative;
}

.active-link a::before {
  content: '';
  position: absolute;
  width: 100%;
  background-color: #FE684F;
  bottom: -4px;
  height: 3px;
}

a {
  text-decoration: none;
  font-size: 1.25em;
}

a:hover {
  color: #FE684F;
}

</style>
