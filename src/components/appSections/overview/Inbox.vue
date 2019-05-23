<template>
  <div>
    <app-title :lvl='1'>Inbox</app-title>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Title from '@/components/appComponents/Title.vue';
import IconGroup from '@/components/dropdown/IconGroup.vue';

export default Vue.extend({
  components: {
    'app-title': Title,
  },
});
</script>

<style scoped>

</style>
