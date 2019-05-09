<template>
  <nav>
    <section>
    </section>
    <section>
      <span class='magicLine magic-line' :class='$store.state.theme.style' ref='magicLine'></span>
      <transition-group :class='$store.state.theme.style' name='nav-link'>
        <nav-link to='/' ref='/' key='nav-link-home' @click='$parent.navigate'>{{ lang('navBarHome') }}</nav-link>
        <nav-link to='/login' ref='/login' key='nav-link-login' @click='$parent.navigate'>{{ lang('navBarLogin') }}</nav-link>
        <nav-link to='/signup' ref='/signup' key='nav-link-signup' @click='$parent.navigate'>{{ lang('navBarSignup') }}</nav-link>
        <nav-link to='/user' ref='/user' key='nav-link-user' @click='$parent.navigate' v-if='lang.isAuthenticated'>{{ lang('navBarUser') }}</nav-link>
        <nav-link v-if='$store.getters.isAuthenticated' to='/logout' key='nav-link-logout'>{{ lang('navBarLogout') }}</nav-link>
      </transition-group>
    </section>
    <section>
      <dropdown class='navBar-margin-right text-align'>
        <template v-slot:handle>
          <icon class="icon-color-hover pointer" sz="big" ico="globe"></icon>
        </template>
        <template v-slot:content>
          <el @click='$parent.changeLang("en")'>English</el>
          <el @click='$parent.changeLang("pt-BR")'>Português(Brasil)</el>
        </template>
      </dropdown>
      <icon class='icon-color-hover pointer' sz='big' ico='adjust' @click='$parent.invertTheme'></icon>
    </section>
  </nav>
</template>

<script lang="ts">
import Vue from 'vue';

import NavLink from './Nav-link.vue';
import Icon from './../generalComponents/Icon.vue';
import Dropdown from './../dropdown/CenterDropdown.vue';
import TextDropdownElement from './../dropdown/TextElement.vue';

export default Vue.extend({
  components: {
    'nav-link': NavLink,
    'icon': Icon,
    'dropdown': Dropdown,
    'el': TextDropdownElement,
  },
  computed: {
    lang(): string {
      return this.$store.getters['lang/l'];
    },
  },
  mounted() {
    setTimeout(() => {
      this.moveMagicLine(this.$route.path);
    }, 100);
  },
  methods: {
    moveMagicLine(str: string) {
      const el: any = this.$refs[str];
      const magicLineStr = 'magicLine';
      const magicLine: any = this.$refs[magicLineStr];

      const left: any = el.$el.offsetLeft;
      const width: any = el.$el.clientWidth;

      magicLine.style.left = left + 'px';
      magicLine.style.width = width + 'px';
    },
  },
  watch: {
    '$route.path'() {
      this.moveMagicLine(this.$route.path);
    },
  },
});
</script>

<style scoped>

</style>
