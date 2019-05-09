<template>
  <div class='background' :class='$store.state.theme.style'>
    <route to='/' @click='hideMobileSection'>{{ lang('navBarHome') }}</route>
    <route to='/login' @click='hideMobileSection'>{{ lang('navBarLogin') }}</route>
    <route to='/signup' @click='hideMobileSection'>{{ lang('navBarSignup') }}</route>
    <route to='/user' @click='hideMobileSection' v-if='lang.isAuthenticated'>{{ lang('navBarUser') }}</route>
    <route v-if='$store.getters.isAuthenticated' to='/logout'>{{ lang('navBarLogout') }}</route>
    <dropdown class='navBar-margin-right navBar-margin-top text-align'>
      <template v-slot:handle>
        <icon class="icon-color-hover pointer" sz="big" ico="globe"></icon>
      </template>
      <template v-slot:content>
        <el @click='changeLang("en")'>English</el>
        <el @click='changeLang("pt-BR")'>Português(Brasil)</el>
      </template>
    </dropdown>
    <icon class='icon-color-hover pointer' sz='big' ico='adjust' @click='invertTheme'></icon>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Route from './Mobile-link.vue';
import Dropdown from './../dropdown/CenterDropdown.vue';
import Icon from './../generalComponents/Icon.vue';
import DropElement from './../dropdown/TextElement.vue';

export default Vue.extend({
  components: {
    route: Route,
    dropdown: Dropdown,
    icon: Icon,
    el: DropElement,
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
    changeLang(lang: string) {
      this.$store.dispatch('lang/setLanguage', lang);
    },
    invertTheme(): void {
      this.$store.commit('theme/invertTheme');
    },
  },
});
</script>

<style scoped>

.navBar-margin-right {
  margin-right: 28px;
}

.navBar-margin-top {
  margin-top: 14px;
}

div {
  top: 70px;
}

#mobile-section {
  text-align: right;
  padding-right: 30px;
}

</style>
