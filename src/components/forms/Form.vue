<template>
  <article :class='$store.getters.style("card-round")' class='form'>
    <slot></slot>
  </article>
</template>

<script lang="ts">
import Vue from 'vue';
import Vuex from 'vuex'

export const bus = new Vue();

export default Vue.extend({
  data() {
    return {
      logs: new Map(),
    }
  },
});
</script>

<style scoped>

article.form {
  width: 100%;
  display: flex;
  flex-direction: column;
}

</style>
