<template>
  <div class='app-navBar'>
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
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  height: 10px;
  margin: 20px 18px;
  z-index: 5;
}

</style>
