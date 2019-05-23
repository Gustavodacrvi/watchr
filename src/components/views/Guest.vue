<template>
  <app :web-storage='true'></app>
</template>

<script lang="ts">
import Vue from 'vue';
import App from '@/components/views/App.vue';

export default Vue.extend({
  components: {
    app: App,
  },
});
</script>
