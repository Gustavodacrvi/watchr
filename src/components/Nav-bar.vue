<template>
  <nav :class="$store.getters.card">
    <section>
    </section>
    <section>
      <nav-link> fdaasdf</nav-link>
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
  height: 40px;
  padding: 0 5%;
  position: relative;

  display: flex;
  align-items: center;
}

nav > section {
  height: 100%;
  flex-basis: 42.5%;
}

nav > :nth-child(1) {
  flex-basis: 15%;
}



</style>

