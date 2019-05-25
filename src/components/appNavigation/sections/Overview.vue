<template>
  <icon-section ico='home' title='Overview' :top="[
      {txt: 'Today', to: 'today', id: 'overview-today-section', ico: 'calendar-day'},
      {txt: 'Inbox', to: 'inbox', id: 'overview-inbox-section', ico: 'inbox'},
      {txt: 'Upcoming', to: 'upcoming', id: 'overview-upcoming-section', ico: 'calendar-alt'},
      {txt: 'Anytime', to: 'anytime', id: 'overview-anytime-section', ico: 'layer-group'},
      {txt: 'Someday', to: 'someday', id: 'overview-someday-section', ico: 'archive'},
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

