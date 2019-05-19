<template>
  <div @click='$store.commit("app/nav/click")' id='app-navigation' :class='[$store.state.theme.style, isOpened ? "opened" : "closed", !isDesktop ? "mobile" : ""]'>
    <div id='navigation-margin'></div>
    <icon-section ico='home' :top="[
      {txt: 'Overview', to: 'overview'},
      {txt: 'Inbox', to: 'inbox'},
      {txt: 'Upcoming', to: 'upcoming'},
    ]"
    :middle="[
      {txt: 'Middle', to: 'comp'},
    ]"
    :bottom="[
      {txt: 'bottom', to: 'fdsa'}
    ]">
    </icon-section>
    <icon v-if='isDesktop' class='pointer icon-color-hover' ico='bars' sz='big-big' id='navigation-toggle' @click='toggleNavBar'></icon>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
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
