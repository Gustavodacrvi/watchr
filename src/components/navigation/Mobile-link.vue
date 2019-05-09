<template>
  <div class='mobile-link' :class='{"active-link": isActive}'>
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
  
}

</style>
