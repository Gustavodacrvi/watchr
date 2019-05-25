<template>
  <icon-section ico='layer-group' title='Perspectives' :top="[
    {txt: 'Custom', to: 'custom', id: 'custom-perspective'},
  ]" 
  :middle="[
    {type: 'Link Group', lvl: 1, title: 'Task Type', links: [
      {txt: 'Periodic', to: 'something', id: 'periodic-perspective'},
      {txt: 'Time Specific', to: 'something2', id: 'time-specific-perspective'},
      {txt: 'Inbox', to: 'somethin3', id: 'inbox-perspective'},
      {txt: 'Anytime', to: 'something4', id: 'anytime-perspective'},
    ]},
    {type: 'Link Group', lvl: 1, title: 'Time', links: [
      {txt: 'Today', to: 'something4', id: 'today-perspective'},
      {txt: 'Tomorrow', to: 'something6', id: 'tomorrow-perspective'},
      {txt: 'Next 7 days', to: 'someth', id: 'next 7 days-perspective'},
    ]},
    {type: 'Link Group', lvl: 1, title: 'Priority', links: [
      {txt: 'High', to: 'sometasdfhing4', id: 'high-priority-perspective'},
      {txt: 'Medium', to: 'sometfdshing6', id: 'medium-priority-perspective'},
      {txt: 'Low', to: 'sometlowh', id: 'low-priority-perspective'},
      {txt: 'No priority', to: 'sometlownoh', id: 'no-priority-perspective'},
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
