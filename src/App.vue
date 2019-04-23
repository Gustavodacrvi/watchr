<template>
  <div id='body' :class='$store.getters.style("bodyBackground")'>
    <nav-bar></nav-bar>
    <transition :name='$store.getters.style("router-view")' mode='out-in'>
      <router-view/>
    </transition>
    <toast></toast>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import NavBar from './components/navigation/Nav-bar.vue';
import Toast from './components/Toast.vue';

export default Vue.extend({
  components: {
    'nav-bar': NavBar,
    'toast': Toast,
  },
});
</script>



<style>
@import './assets/css/light/light.css';
@import './assets/css/light/vueTransitions.css';
@import './assets/css/light/toast.css';
@import './assets/css/light/input.css';
@import './assets/css/light/button.css';
@import './assets/css/light/icon.css';
@import './assets/css/fontawesome.min.css';

body {
  margin: 0;
}

#body {
  position: absolute;
  width: 100%;
  height: 100%;
}

</style>
