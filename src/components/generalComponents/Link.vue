<template>
  <router-link class='route-link' :class='$store.state.theme.style' :to='to'><slot></slot></router-link>  
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

.route-link {
  text-decoration: none;
  color: #6387ff;
}

.route-link:hover {
  text-decoration: underline;
}



</style>

