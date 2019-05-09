<template>
  <div class='background' :class='$store.state.theme.style'>
    <route to='/' @click='hideMobileSection'>{{ lang('navBarHome') }}</route>
    <route to='/login' @click='hideMobileSection'>{{ lang('navBarLogin') }}</route>
    <route to='/signup' @click='hideMobileSection'>{{ lang('navBarSignup') }}</route>
    <route to='/user' @click='hideMobileSection' v-if='lang.isAuthenticated'>{{ lang('navBarUser') }}</route>
    <route v-if='$store.getters.isAuthenticated' to='/logout'>{{ lang('navBarLogout') }}</route>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Route from './Mobile-link.vue';

export default Vue.extend({
  components: {
    route: Route,
  },
  computed: {
    lang(): string {
      return this.$store.getters['lang/l'];
    },
  },
  methods: {
    hideMobileSection() {
      this.$store.commit('hideMobileSection');
    },
  },
});
</script>

<style scoped>

div {
  top: 70px;
}

</style>
