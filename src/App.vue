<template>
  <div id='body' :class="$store.getters.style('bodyBackground')">
    <nav-bar></nav-bar>
    <router-view/>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import NavBar from './components/navigation/Nav-bar.vue';

export default Vue.extend({
  components: {
    'nav-bar': NavBar,
  },
});
</script>



<style>

@font-face {
  font-family: 'Work Sans';
  src: url('/assets/fonts/WorkSans-Light.otf');
}

body {
  margin: 0;
  font-family: 'Work Sans';
}

#body {
  position: absolute;
  width: 100%;
  height: 100%;
}

span, a {
  color: #969c9c;
}

</style>
