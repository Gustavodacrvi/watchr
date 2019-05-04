<template>
  <nav>
    <section>
    </section>
    <section>
      <span class='magicLine magic-line' :class='$store.state.style' ref='magicLine'></span>
      <transition-group :class='$store.state.style' name='nav-link'>
        <nav-link to='/' ref='/' key='nav-link-home' @click='navigate'>{{ this.$store.getters.l('navBarHome') }}</nav-link>
        <nav-link to='/login' ref='/login' key='nav-link-login' @click='navigate'>{{ this.$store.getters.l('navBarLogin') }}</nav-link>
        <nav-link to='/signup' ref='/signup' key='nav-link-signup' @click='navigate'>{{ this.$store.getters.l('navBarSignup') }}</nav-link>
        <nav-link to='/user' ref='/user' key='nav-link-user' @click='navigate' v-if='$store.getters.isAuthenticated'>{{ this.$store.getters.l('navBarUser') }}</nav-link>
        <nav-link v-if='$store.getters.isAuthenticated' to='/logout' key='nav-link-logout'>{{ this.$store.getters.l('navBarLogout') }}</nav-link>
      </transition-group>
    </section>
    <section>
      <dropdown class='navBar-margin text-align'>
        <template v-slot:handle>
          <icon class="icon-color-hover pointer" sz="big" ico="globe"></icon>
        </template>
        <template v-slot:content>
          <el>fdsa</el>
          <el>fdsafdas f</el>
          <el>fdsafdafasfdsaf sf</el>
          <el>fdsafdaff</el>
        </template>
      </dropdown>
      <icon class='icon-color-hover pointer' sz='big' ico='adjust' @click='invertTheme'></icon>
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
  mounted() {
    setTimeout(() => {
      this.moveMagicLine(this.$route.path);
    }, 100);
  },
  methods: {
    invertTheme(): void {
      this.$store.commit('invertTheme');
    },
    navigate(route: string) {
      this.$router.push(route);
    },
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

.magicLine {
  position: absolute;
  transition-duration: .2s;
  bottom: 0;
  height: 3px;
}

.navBar-margin {
  margin: 0 25px;
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
