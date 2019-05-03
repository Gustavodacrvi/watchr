<template>
  <router-link class='route-link' :class='$store.state.style' :to='to'><slot></slot></router-link>  
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

