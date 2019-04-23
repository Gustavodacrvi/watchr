<template>
  <router-link :class='$store.getters.style("route-link")' :to='to'><slot></slot></router-link>  
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  props: {
    to: String,
  },
});
</script>

<style scoped>


</style>

