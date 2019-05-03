<template>
  <nav>
    <section>
    </section>
    <section>
      <span class='magicLine magic-line' :class='$store.state.style' ref='magicLine'></span>
      <transition-group :class='$store.state.style' name='nav-link'>
        <nav-link to='/' ref='/' key='nav-link-home'>Home</nav-link>
        <nav-link to='/login' ref='/login' key='nav-link-login'>Login</nav-link>
        <nav-link to='/signup' ref='/signup' key='nav-link-signup'>Signup</nav-link>
        <nav-link v-if='$store.getters.isAuthenticated' to='/user' key='nav-link-user'>User</nav-link>
        <nav-link v-if='$store.getters.isAuthenticated' to='/logout' key='nav-link-logout'>Logout</nav-link>
      </transition-group>
    </section>
    <section>
    </section>
  </nav>
</template>

<script lang="ts">
import Vue from 'vue';
import NavLink from './Nav-link.vue';
import Icon from './../generalComponents/Icon.vue';

export default Vue.extend({
  components: {
    'nav-link': NavLink,
    'icon': Icon,
  },
  mounted() {
    this.moveMagicLine(this.$route.path);
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
