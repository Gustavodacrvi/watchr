<template>
  <div>
    <routine></routine>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Routine from '@/components/appComponents/Routine.vue';

export default Vue.extend({
  components: {
    routine: Routine,
  },
});
</script>

<style scoped>

</style>
