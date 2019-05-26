<template>
  <div>
    <app-title :lvl='lvl'><slot></slot></app-title>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Heading from '@/components/regular/Heading.vue';

export default Vue.extend({
  components: {
    'app-title': Heading,
  },
  props: {
    lvl: Number,
  },
});
</script>

<style scoped>

</style>

