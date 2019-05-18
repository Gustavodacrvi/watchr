<template>
  <desktop v-if='$store.getters.NavbarisOnDesktop'></desktop>
  <mobile v-else></mobile>
</template>

<script lang="ts">
import Vue from 'vue';
import Desktop from '@/components/navigation/Desktop.vue';
import Mobile from '@/components/navigation/Mobile.vue';

export default Vue.extend({
  components: {
    desktop: Desktop,
    mobile: Mobile,
  },
});
</script>
