<template>
  <nav>
    <section>
      first
    </section>
    <section>
      second
    </section>
    <section>
      thirt
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
  width: 96%;
  box-shadow: 2px 2px 10px rgba(200,200,200);
  background-color: #fff;
  height: 40px;
  padding: 0 2%;

  display: flex;
  align-items: center;
}

nav > section {
  height: 100%;
  flex-basis: 33%;
}



</style>

