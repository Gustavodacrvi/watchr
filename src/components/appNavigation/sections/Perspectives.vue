<template>
  <icon-section ico='layer-group' title='Perspectives' :top="[
    {txt: 'Custom', to: 'custom'},
  ]" 
  :middle="[
    {type: 'Link Group', lvl: 1, title: 'Task Type', links: [
      {txt: 'Periodic', to: 'something'},
      {txt: 'Time Specific', to: 'something2'},
      {txt: 'Inbox', to: 'somethin3'},
      {txt: 'Anytime', to: 'something4'},
    ]},
    {type: 'Link Group', lvl: 1, title: 'Time', links: [
      {txt: 'Today', to: 'something4'},
      {txt: 'Tomorrow', to: 'something6'},
      {txt: 'Next 7 days', to: 'someth'},
    ]},
    {type: 'Link Group', lvl: 1, title: 'Priority', links: [
      {txt: 'High', to: 'sometasdfhing4'},
      {txt: 'Medium', to: 'sometfdshing6'},
      {txt: 'Low', to: 'sometlowh'},
      {txt: 'No priority', to: 'sometlownoh'},
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
