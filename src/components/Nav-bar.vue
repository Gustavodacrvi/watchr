<template>
  <nav :style="$store.getters.card">
    <section>
    </section>
    <section>
    </section>
    <section>
    </section>
  </nav>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
});
</script>


<style scoped>
nav {
  width: 90%;
  height: 40px;
  padding: 0 5%;

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

