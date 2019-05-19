<template>
  <icon-section ico='home' title='Overview' :top="[
      {txt: 'Today', to: 'today', ico: 'calendar-day'},
      {txt: 'Inbox', to: 'inbox', ico: 'inbox'},
      {txt: 'Upcoming', to: 'upcoming', ico: 'calendar-alt'},
      {txt: 'Anytime', to: 'anytime', ico: 'layer-group'},
      {txt: 'Someday', to: 'someday', ico: 'archive'},
    ]"
    :middle="[
    ]"
    :bottom="[
    ]"></icon-section>
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

