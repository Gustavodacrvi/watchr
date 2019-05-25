<template>
  <icon-section ico='home' title='Overview' :top="[
      {txt: 'Today', to: 'today', id: 'overview-today-section', callback: callback, ico: 'calendar-day'},
      {txt: 'Inbox', to: 'inbox', id: 'overview-inbox-section', callback: callback, ico: 'inbox'},
      {txt: 'Upcoming', to: 'upcoming', id: 'overview-upcoming-section', callback: callback, ico: 'calendar-alt'},
      {txt: 'Anytime', to: 'anytime', id: 'overview-anytime-section', callback: callback, ico: 'layer-group'},
      {txt: 'Someday', to: 'someday', id: 'overview-someday-section', callback: callback, ico: 'archive'},
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
  methods: {
    callback() {
      console.log('I am the section callback');
    },
  },
});
</script>

