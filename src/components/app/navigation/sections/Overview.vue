<template>
  <icon-section ico='home' title='Overview' :top="[
      {txt: 'Today', to: 'today', id: 'overview-today-section', ico: 'calendar-day', iconColor: '#ffe366'},
      {txt: 'Inbox', to: 'inbox', id: 'overview-inbox-section', ico: 'inbox', iconColor: '#83b7e2'},
      {txt: 'Upcoming', to: 'upcoming', id: 'overview-upcoming-section', ico: 'calendar-alt', iconColor: '#ff6b66'},
      {txt: 'Anytime', to: 'anytime', id: 'overview-anytime-section', ico: 'layer-group', iconColor: '#88ddb7'},
      {txt: 'Someday', to: 'someday', id: 'overview-someday-section', ico: 'archive', iconColor: '#e2b983'},
    ]"
    :middle="[
    ]"
    :bottom="[
    ]"></icon-section>
</template>

<script lang="ts">
import Vue from 'vue';
import Section from '@/components/app/navigation/Section.vue';

export default Vue.extend({
  components: {
    'icon-section': Section,
  },

});
</script>

