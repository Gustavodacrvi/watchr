<template>
  <icon-section ico='stream' title='Time tracking' :top="[
    {txt: 'Custom routines', to: 'routeinscustom', id: 'custom-routines-perspective'},
  ]" 
  :middle="[
    {type: 'Link Group', lvl: 1, title: 'Intervals', links: [
    ]},
    {type: 'Link Group', lvl: 1, title: 'Routines', links: [
    ]},
  ]" 
  :bottom="[]"
  ></icon-section>
</template>

<script lang="ts">
import Vue from 'vue';
import Section from '@/components/appNavigation/Section.vue';

export default Vue.extend({
  components: {
    'icon-section': Section,
  },
});

</script>
