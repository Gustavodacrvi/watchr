<template>
  <nav>
    <section>
    </section>
    <section>
      <transition-group :name='$store.getters.style("nav-link")'>
        <nav-link to='/' key='nav-link-home'>Home</nav-link>
        <nav-link to='/login' key='nav-link-login'>Login</nav-link>
        <nav-link to='/signup' key='nav-link-signup'>Signup</nav-link>
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

export default Vue.extend({
  components: {
    'nav-link': NavLink,
  },
});
</script>


<style scoped>
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

