<template>
  <span class='app-title'>
    <app-title :lvl='lvl'><slot></slot></app-title>
  </span>
</template>

<script lang="ts">
import Vue from 'vue';
import Heading from '@/components/generalComponents/Heading.vue';

export default Vue.extend({
  components: {
    'app-title': Heading,
  },
  props: {
    lvl: Number,
  }
});
</script>

<style scoped>

</style>

