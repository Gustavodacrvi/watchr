<template>
  <div @click='$store.commit("app/nav/click")' id='app-navigation' :class='[$store.state.theme.style, isOpened ? "opened" : "closed", !isDesktop ? "mobile" : ""]' @mouseleave='hideNav'>
    <div id='navigation-margin'></div>
    <icon-section ico='home' title='Overview' :top="[
      {txt: 'Today', to: 'today', ico: 'calendar-day'},
      {txt: 'Inbox', to: 'inbox', ico: 'inbox'},
      {txt: 'Upcoming', to: 'upcoming', ico: 'calendar-alt'},
      {txt: 'Anytime', to: 'anytime', ico: 'layer-group'},
      {txt: 'Someday', to: 'someday', ico: 'archive'},
    ]"
    :middle="[
      {txt: 'Middle', to: 'comp'},
    ]"
    :bottom="[
      {txt: 'bottom', to: 'fdsa'}
    ]"></icon-section>
    <icon-section ico='layer-group' title='Perspectives' :top="[]" :middle="[]" :bottom="[]"></icon-section>
    <icon-section ico='project-diagram' title='Projects' :top="[]" :middle="[]" :bottom="[]"></icon-section>
    <icon-section ico='stopwatch' title='Time tracking' :top="[]" :middle="[]" :bottom="[]"></icon-section>
    <icon-section ico='stream' title='Routines and intervals' :top="[]" :middle="[]" :bottom="[]"></icon-section>
    <icon-section ico='tags' title='Tags and labels' :top="[]" :middle="[]" :bottom="[]"></icon-section>
    <icon-section ico='pie-chart' title='Statistics' :top="[]" :middle="[]" :bottom="[]"></icon-section>
    <icon-section ico='cog' title='Settings' :top="[]" :middle="[]" :bottom="[]"></icon-section>
    <icon v-if='isDesktop' class='pointer icon-color-hover' ico='bars' sz='big-big' id='navigation-toggle' @click='toggleNavBar'></icon>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';
import Section from '@/components/appNavigation/Section.vue';
import Icon from '@/components/generalComponents/Icon.vue';

export default Vue.extend({
  components: {
    'icon-section': Section,
    'icon': Icon,
  },
  methods: {
    toggleNavBar() {
      this.$store.commit('app/nav/toggleFixed');
    },
    hideNav() {
      if (!this.$store.state.app.nav.fixed && this.$store.getters.NavbarisOnDesktop) {
        this.$store.commit('app/nav/hide');
      }
    },
  },
  created() {
    if (!this.isDesktop) {
      this.$store.commit('app/nav/hide');
      this.$store.commit('app/nav/unFix');
    }
  },
  computed: {
    isOpened(): boolean {
      return this.$store.state.app.nav.open;
    },
    isDesktop(): boolean {
      return this.$store.getters.NavbarisOnDesktop;
    },
  },
  watch: {
    isDesktop(change: boolean) {
      if (change) {
        this.$store.commit('app/nav/toggleFixed');
      } else {
        this.$store.commit('app/nav/unFix');
        this.$store.commit('app/nav/hide');
      }
    },
  },
});
</script>

<style scoped>

#app-navigation.light.opened {
  background-color: #EEEDED;
  box-shadow: inset 0 0 6px #b4b4b4;
}

#app-navigation.dark.opened {
  background-color: #282828;
}

#app-navigation {
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 5;
  transition-duration: .3s;
}

#app-navigation.opened {
  width: 225px;
}

#app-navigation.closed {
  width: 50px;
}

#app-navigation.closed.mobile {
  left: -50px;
}

#navigation-margin {
  height: 110px;
}

#navigation-toggle {
  position: absolute;
  bottom: 10px;
  margin: 0 10px;
}

</style>
