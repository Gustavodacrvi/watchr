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
