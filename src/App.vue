<template>
  <div>
    <nav-bar></nav-bar>
    <router-view/>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import NavBar from './components/Nav-bar.vue';

export default Vue.extend({
  components: {
    'nav-bar': NavBar,
  },
});
</script>



<style>
body {
  margin: 0;
}

</style>
