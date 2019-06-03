<template>
  <div id='body' class='background' :class='$store.state.theme.style' @click='hideAppNavBar'>
    <section id='content'>
      <nav-bar></nav-bar>
      <app-nav-bar v-if='!isDesktop'></app-nav-bar>
      <div v-if='isStandAlone && isOnAppRoute' class='app-nav-bar-margin'></div>
      <transition :class='$store.state.theme.style' name='fade-transition' mode='out-in'>
        <loading v-if='$root.routerViewLoading'></loading>
        <div v-else id='router-view'>
          <router-view/>
        </div>
      </transition>
    </section>
    <pop-up v-if='isOnAppRoute'></pop-up>
    <mobile-section v-if='!isDesktop && (!isOnAppRoute || (isOnAppRoute && !isStandAlone))'></mobile-section>
    <toast></toast>
  </div>
</template>

<script lang="ts">
/*
  appRoute    standAlone   browser  
  desktop       false        false
  mobile        false        true

  notAppRoute   standAlone  browser
  desktop         false       false
  mobile           true       true
 */


import Vue from 'vue';
import store from '@/store';
import axios from 'axios';
import NavBar from '@/components/navigation/NavBar.vue';
import AppNavBar from '@/components/app/navigation/AppNavBar.vue';
import MobileSection from '@/components/navigation/mobile/MobileSection.vue';
import Toast from '@/components/regular/Toast.vue';
import Loading from '@/components/regular/Loading.vue';

import PopUps from '@/components/app/popUps/PopUp.vue';

import { getCookie, setCookie } from './assets/javaScript/cookies';

export default Vue.extend({
  components: {
    'mobile-section': MobileSection,
    'nav-bar': NavBar,
    'toast': Toast,
    'loading': Loading,
    'app-nav-bar': AppNavBar,
    'pop-up': PopUps,
  },
  data() {
    return {
      clickedOnAppNavBar: false,
    };
  },
  beforeCreate() {
    if (this.$store.getters.isStandAlone) {
      if (store.getters.isAuthenticated) {
        this.$router.push('/user');
      } else {
        this.$router.push('/guest');
      }
    }
  },
  methods: {
    hideAppNavBar() {
      setTimeout(() => {
        if (this.closeNavbar && !this.isDesktop) {
          this.$store.commit('app/nav/hide');
        }
        this.$store.commit('app/nav/fallbackClick');
      }, 10);
    },
  },
  computed: {
    isOnAppRoute(): boolean {
      return this.$route.path === '/guest' || this.$route.path === '/user';
    },
    isDesktop(): boolean {
      return this.$store.getters.NavbarisOnDesktop;
    },
    closeNavbar(): boolean {
      return !this.$store.state.app.nav.clicked && !this.$store.state.app.nav.iconClick && this.isOpened;
    },
    isStandAlone(): boolean {
      return this.$store.getters.isStandAlone;
    },
    isOpened(): boolean {
      return this.$store.state.app.nav.open;
    },
  },
});
</script>

<style>

.shadow.light {
  box-shadow: 0 4px 10px 2px rgba(180, 180, 180, .4) !important;
}

.background.light {
  background-color: #F8F7F6;
}

.card.light, .card-round.light { 
  background-color: #F8F7F6;
  border: .5px solid rgba(207,207,207,.4);
}

.border.dark {
  border: .5px solid rgba(230,230,230,.1);
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
  overflow-x: hidden;
  overflow-y: auto;
  width: 100vw;
  height: 100vh;
}

#content {
  display: flex;
  position: absolute;
  height: 100%;
  width: 100%;
  right: 0;
  flex-direction: column;
  transition-duration: .3s;
}

.reduced-brightness {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  z-index: 100;
}

#mobile-section {
  position: absolute;
  right: -150px;
  box-sizing: border-box;
  height: 100%;
  width: 150px;
  transition: right .3s;
}

#router-view {
  position: relative;
  height: 100%;
}

.mainColor {
  color: #A97CFC;
}

.card-round {
  border-radius: 12px;
}

.bright.dark {
  background-color: #3d3d3d;
}

span, a, p {
  color: #808080;
}

.app-nav-bar-margin {
  height: 40px;
}

.toast-transition-enter {
  bottom: -80px !important;
}

.toast-transition-enter-active {
  transition-duration: .3s;
}

.toast-transition-leave-active {
  transition-duration: .3s;
  bottom: -80px !important;
}

.fade-transition-enter-active, .fade-transition-leave-active {
  transition: opacity .2s;
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

.list-enter-active, .list-leave-active {
  transition: all 1s;
}
.list-enter, .list-leave-to {
  opacity: 0;
}

</style>
