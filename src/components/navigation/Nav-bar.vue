<template>
  <nav :class="$store.getters.style('card')">
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
  width: 90%;
  height: 48px;
  padding: 0 5%;
  position: relative;

  display: flex;
  align-items: center;
}

nav > section {
  height: 100%;
  flex-basis: 40%;
}

nav > :nth-child(1) {
  flex-basis: 20%;
}

</style>

