<template>
  <div id='body' class='background' :class='$store.state.style'>
    <nav-bar></nav-bar>
    <transition :class='$store.state.style' name='fade-transition' mode='out-in'>
      <loading v-if='$root.routerViewLoading'></loading>
      <router-view v-else/>
    </transition>
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
@import './assets/css/main/button.css';
@import './assets/css/main/fontawesome.min.css';
@import './assets/css/main/icon.css';
@import './assets/css/main/input.css';
@import './assets/css/main/main.css';
@import './assets/css/main/toast.css';
@import './assets/css/main/transitions.css';
@import './assets/css/main/dropdown.css';

@import './assets/css/light/main.css';
@import './assets/css/light/toast.css';
@import './assets/css/light/input.css';

@import './assets/css/dark/main.css';
@import './assets/css/dark/toast.css';
@import './assets/css/dark/input.css';


body {
  margin: 0;
}

#body {
  position: absolute;
  width: 100%;
  height: 100%;
}

</style>
