<template>
  <div id='body' :class="$store.getters.bodyBackground">
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

#body {
  position: absolute;
  width: 100%;
  height: 100%;
}

span {
  color: #989398;
}

</style>
