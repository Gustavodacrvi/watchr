<template>
  <desktop v-if='$store.getters.NavbarisOnDesktop'></desktop>
  <mobile v-else></mobile>
</template>

<script lang="ts">
import Vue from 'vue';
import Desktop from './Desktop.vue';
import Mobile from './Mobile.vue';

export default Vue.extend({
  components: {
    desktop: Desktop,
    mobile: Mobile,
  },
  methods: {
    invertTheme(): void {
      this.$store.commit('theme/invertTheme');
    },
    navigate(route: string) {
      this.$router.push(route);
    },
    changeLang(lang: string) {
      this.$store.dispatch('lang/setLanguage', lang);
    },
  },
});
</script>


<style scoped>


</style>
