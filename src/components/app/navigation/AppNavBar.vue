<template>
  <div class='background app-navBar' :class='[{app: $store.getters.isOnMobileApp}, $store.state.theme.style]'>
    <nav-icon class='nav-icon' position='left' :active='this.$store.state.app.nav.open' @toggle='showNavBar'></nav-icon>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import NavIcon from '@/components/navigation/Icon.vue';

export default Vue.extend({
  components: {
    'nav-icon': NavIcon,
  },
  methods: {
    showNavBar() {
      this.$store.commit('app/nav/iconClick');
      this.$store.commit('app/nav/show');
    },
  },
});
</script>

<style scoped>

.app-navBar {
  position: absolute;
  width: 100%;
  top: 0;
  left: 0;
  padding: 20px 18px;
  padding-bottom: 6px;
  z-index: 5;
}

.app {
  position: fixed;
  background-color: #F8F7F6;
  left: 0;
}

.light {
  box-shadow: 0 0 5px 10px #F8F7F6;
}

.dark {
  box-shadow: 0 0 5px 10px #1F1F1F;
}

</style>
