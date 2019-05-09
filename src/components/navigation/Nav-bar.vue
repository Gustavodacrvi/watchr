<template>
  <desktop v-if='isDesktop'></desktop>
</template>

<script lang="ts">
import Vue from 'vue';
import Desktop from './desktop.vue';
import Mobile from './mobile.vue';

export default Vue.extend({
  components: {
    desktop: Desktop,
    mobile: Mobile,
  },
  computed: {
    isDesktop() {
      const width = this.$store.state.width;
      if (width > 1024) {
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

.magic-line {
  background-color: #FE684F;
}

.magicLine {
  position: absolute;
  transition-duration: .2s;
  bottom: 0;
  height: 3px;
}

.navBar-margin-right {
  margin-right: 25px;
}

nav {
  height: 48px;
  margin: 25px 50px;
  position: relative;
}

nav > section {
  height: 100%;
}

nav > :nth-child(2) {
  display: inline-block;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

nav > :nth-child(1) {
  clear: left;
  float: left;
}

nav > :nth-child(3) {
  float: right;
  clear: right;
}

</style>
