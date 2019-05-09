<template>
  <desktop v-if='isDesktop'></desktop>
</template>

<script lang="ts">
import Vue from 'vue';
import Desktop from './desktop.vue';

export default Vue.extend({
  components: {
    desktop: Desktop,
  },
  computed: {
    isDesktop() {
      const width = this.$store.state.windowWidth;
      if (width > 824) {
        return true;
      }
      return false;
    },
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
