<template>
  <desktop v-if='$store.getters.NavbarisOnDesktop'></desktop>
  <mobile v-else></mobile>
</template>

<script lang="ts">
import Vue from 'vue';
import Desktop from '@/components/navigation/desktop/Desktop.vue';
import Mobile from '@/components/navigation/mobile/Mobile.vue';

export default Vue.extend({
  components: {
    desktop: Desktop,
    mobile: Mobile,
  },
});
</script>
