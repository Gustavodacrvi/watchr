<template>
  <app :web-storage='true'></app>
</template>

<script lang="ts">
import Vue from 'vue';
import App from '@/components/app/App.vue';

export default Vue.extend({
  components: {
    app: App,
  },
});
</script>
