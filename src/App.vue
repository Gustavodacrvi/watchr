<template>
  <div id='body' :class='$store.getters.style("bodyBackground")'>
    <nav-bar></nav-bar>
    <transition :name='$store.getters.style("router-view")' mode='out-in'>
      <router-view/>
    </transition>
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

body {
  margin: 0;
}

#body {
  position: absolute;
  width: 100%;
  height: 100%;
}

</style>
