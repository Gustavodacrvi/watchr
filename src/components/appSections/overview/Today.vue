<template>
  <div>
    <app-title :lvl='1'>Today</app-title>
    <routine></routine>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Routine from '@/components/appComponents/Routine.vue';
import Title from '@/components/generalComponents/Heading.vue';

export default Vue.extend({
  components: {
    'routine': Routine,
    'app-title': Title,
  },
});
</script>

<style scoped>

.perspective {
  margin-top: -25px;
}

</style>
