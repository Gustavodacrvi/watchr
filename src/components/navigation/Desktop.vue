<template>
  <nav>
    <section>
    </section>
    <section>
      <span class='magicLine magic-line' :class='$store.state.theme.style' ref='magicLine'></span>
      <transition-group :class='$store.state.theme.style' name='nav-link'>
        <nav-link to='/' ref='/' key='nav-link-home'>{{ lang('navBarHome') }}</nav-link>
        <nav-link to='/login' ref='/login' key='nav-link-login'>{{ lang('navBarLogin') }}</nav-link>
        <nav-link to='/signup' ref='/signup' key='nav-link-signup'>{{ lang('navBarSignup') }}</nav-link>
        <nav-link to='/guest' ref='/guest' key='nav-link-guest'>{{ lang('navBarGuest') }}</nav-link>
        <nav-link to='/user' ref='/user' key='nav-link-user' v-if='$store.getters.isAuthenticated'>{{ lang('navBarUser') }}</nav-link>
        <nav-link v-if='$store.getters.isAuthenticated' to='/logout' key='nav-link-logout'>{{ lang('navBarLogout') }}</nav-link>
      </transition-group>
    </section>
    <icon-group></icon-group>
  </nav>
</template>

<script lang="ts">
import Vue from 'vue';

import NavLink from './Nav-link.vue';
import Icon from './../generalComponents/Icon.vue';
import IconGroup from './Navigation-icon-group.vue';

export default Vue.extend({
  components: {
    'icon-group': IconGroup,
    'nav-link': NavLink,
    'icon': Icon,
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

.magic-line {
  background-color: #FE684F;
}

.magicLine {
  position: absolute;
  transition-duration: .2s;
  bottom: 0;
  height: 3px;
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
