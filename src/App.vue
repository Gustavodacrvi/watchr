<template>
  <div id='body' class='background' :class='$store.state.theme.style' @click='hideAppNavBar'>
    <section id='content'>
      <nav-bar v-if='!($store.getters.isOnMobileApp && isOnAppRoute)'></nav-bar>
      <app-nav-bar v-if='isOnAppRoute && !$store.getters.NavbarisOnDesktop'></app-nav-bar>
      <transition :class='$store.state.theme.style' name='fade-transition' mode='out-in'>
        <loading v-if='$root.routerViewLoading'></loading>
        <div v-else id='router-view'>
          <router-view/>
        </div>
      </transition>
    </section>
    <mobile-section id='mobile-section' v-if='!$store.getters.NavbarisOnDesktop && !isOnAppRoute'></mobile-section>
    <toast></toast>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import store from '@/store';
import axios from 'axios';
import NavBar from '@/components/navigation/NavBar.vue';
import AppNavBar from '@/components/appNavigation/AppNavBar.vue';
import MobileSection from '@/components/navigation/mobile/MobileSection.vue';
import Toast from '@/components/generalComponents/Toast.vue';
import Loading from '@/components/generalComponents/Loading.vue';

import { getCookie, setCookie } from './assets/javaScript/cookies';

export default Vue.extend({
  components: {
    'mobile-section': MobileSection,
    'nav-bar': NavBar,
    'toast': Toast,
    'loading': Loading,
    'app-nav-bar': AppNavBar,
  },
  data() {
    return {
      clickedOnAppNavBar: false,
    };
  },
  methods: {
    hideAppNavBar() {
      setTimeout(() => {
        if (this.closeNavbar && this.$store.state.NavbarisOnDesktop) {
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
    closeNavbar(): boolean {
      return !this.$store.state.app.nav.clicked && !this.$store.state.app.nav.iconClick && this.isOpened;
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
  background-color: #FAFAF9;
  box-shadow: 0 4px 14px rgba(207,207,207,0.4);
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

span, a, p {
  color: #999999;
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

</style>
