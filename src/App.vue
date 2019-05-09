<template>
  <div id='body' class='background' :class='$store.state.theme.style'>
    <section id='content'>
      <nav-bar></nav-bar>
      <transition :class='$store.state.theme.style' name='fade-transition' mode='out-in'>
        <loading v-if='$root.routerViewLoading'></loading>
        <div v-else id='router-view'>
          <router-view/>
        </div>
      </transition>
    </section>
    <toast></toast>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import store from './store';
import axios from 'axios';
import NavBar from './components/navigation/Nav-bar.vue';
import Toast from './components/generalComponents/Toast.vue';
import Loading from './components/generalComponents/Loading.vue';

import { getCookie, setCookie } from './assets/javaScript/cookies';

export default Vue.extend({
  components: {
    'nav-bar': NavBar,
    'toast': Toast,
    'loading': Loading,
  },
});
</script>



<style>

.shadow.light {
  box-shadow: 0 4px 10px 2px rgba(180, 180, 180, .4) !important;
}

.background.light {
  background-color: #f8f6f6;
}

.card.light, .card-round.light { 
  background-color: #fff;
  box-shadow: 0 2px 6px rgba(220,220,220,0.4);
}

.background.dark {
  background-color: #1F1F1F;
}

.card.dark, .card-round.dark { 
  background-color: #282828;
}


@font-face {
  font-family: 'Work Sans';
  src: url('/assets/fonts/WorkSans-Regular.otf');
}

body {
  font-family: 'Work Sans';
  margin: 0;
}

#body {
  position: relative;
  overflow: auto;
  width: 100vw;
  height: 100vh;
}

#content {
  display: flex;
  position: absolute;
  height: 100%;
  width: 100%;
  flex-direction: column;
}

#router-view {
  position: relative;
  height: 100%;
}

.mainColor {
  color: #FE684F;
}

.card-round {
  border-radius: 8px;
}

span, a, p {
  color: #ADADAD;
}


.toast-transition-enter {
  bottom: -40px !important;
}

.toast-transition-enter-active {
  transition-duration: .3s;
}

.toast-transition-leave-active {
  transition-duration: .3s;
  bottom: -40px !important;
}

.fade-transition-active, .fade-transition-leave-active {
  transition: opacity .1s;
}
.fade-transition-enter, .fade-transition-leave-to {
  opacity: 0;
}

.nav-link-enter-active, .nav-link-leave-active {
  transition: opacity .3s;
}
.nav-link-enter, .nav-link-leave-to {
  opacity: 0;
}


</style>
