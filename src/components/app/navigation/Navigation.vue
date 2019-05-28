<template>
  <div @click='$store.commit("app/nav/click")' class='card' id='app-navigation' :class='[$store.state.theme.style, isOpened ? "opened" : "closed", !isDesktop ? "mobile" : ""]' @mouseleave='hideNav'>
    <div id='navigation-margin'></div>
    <overview></overview>
    <perspectives></perspectives>
    <icon-section ico='project-diagram' title='Projects' :top="[]" :middle="[]" :bottom="[]"></icon-section>
    <time-tracking></time-tracking>
    <routines-intervals></routines-intervals>
    <tags-labels></tags-labels>
    <icon-section ico='pie-chart' title='Statistics' :top="[]" :middle="[]" :bottom="[]"></icon-section>
    <icon-section ico='cog' title='Settings' :top="[]" :middle="[]" :bottom="[]"></icon-section>
    <icon v-if='isDesktop' class='pointer icon-color-hover' ico='bars' sz='medium-medium' id='navigation-toggle' @click='toggleNavBar'></icon>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';
import Section from '@/components/app/navigation/Section.vue';
import Icon from '@/components/regular/Icon.vue';

import Overview from '@/components/app/navigation/sections/Overview.vue';
import Perspectives from '@/components/app/navigation/sections/Perspectives.vue';
import TimeTracking from '@/components/app/navigation/sections/TimeTracking.vue';
import RoutinesIntervals from '@/components/app/navigation/sections/RoutinesIntervals.vue';
import TagsLabels from '@/components/app/navigation/sections/TagsLabels.vue';

export default Vue.extend({
  components: {
    'icon-section': Section,
    'icon': Icon,
    'overview': Overview,
    'perspectives': Perspectives,
    'time-tracking': TimeTracking,
    'routines-intervals': RoutinesIntervals,
    'tags-labels': TagsLabels,
  },
  methods: {
    toggleNavBar() {
      this.$store.commit('app/nav/toggleFixed');
    },
    hideNav() {
      if (!this.$store.state.app.nav.fixed) {
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


#app-navigation {
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 5;
  padding-right: 20px;
  transition-duration: .3s;
  overflow-y: auto; 
}

#app-navigation.opened {
  width: 250px;
}

#app-navigation.light {
  background-color: #f0f0f0 !important;
  border: none;
}

#app-navigation.dark {
  background-color: #1C1C1C;
}

#app-navigation.opened.mobile {
  width: 290px;
}

#app-navigation.closed {
  width: 50px;
  background-color: transparent !important;
  box-shadow: none;
}

#app-navigation.closed.mobile {
  left: -50px;
}

#navigation-margin {
  height: 150px;
}

#navigation-toggle {
  position: absolute;
  bottom: 10px;
  margin: 0 10px;
}

#app-navigation::-webkit-scrollbar {
  height: 5px;
}
 
#app-navigation::-webkit-scrollbar-thumb {
  background-color: #A97CFC;
  border-radius: 12px;
}

@media screen and (min-width: 1025px) {
  #app-navigation::-webkit-scrollbar {
    height: 12px;
  }
}

</style>
