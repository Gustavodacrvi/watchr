<template>
  <transition name='fade-transition' mode='out-in'>
    <desktop v-if='$store.getters.NavbarisOnDesktop'></desktop>
    <mobile v-else></mobile>
  </transition>
</template>

<script lang="ts">
import Vue from 'vue';
import Desktop from '@/components/sectionNavigation/Desktop.vue';
import Mobile from '@/components/sectionNavigation/Mobile.vue';

export default Vue.extend({
  components: {
    desktop: Desktop,
    mobile: Mobile,
  },
});
</script>

<style scoped>

</style>
