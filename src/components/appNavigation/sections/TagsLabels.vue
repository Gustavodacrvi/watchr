<template>
  <icon-section ico='tags' title='Time tracking' :top="[
    {txt: 'Untagged', to: 'ntagged'},
  ]" 
  :middle="[
    {type: 'Link Group', lvl: 1, title: 'Calendar Tags', links: [
    ]},
    {type: 'Link Group', lvl: 1, title: 'Labels', links: [
      {txt: '2 min', to: 'cusastasdf'},
    ]},
    {type: 'Link Group', lvl: 1, title: 'Tag Group', links: [
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
