<template>
  <icon-section ico='stopwatch' title='Time tracking' :top="[
    {txt: 'Custom', to: 'timetrackitoday', id: 'custom-time-tracking-perspective'},
    {txt: 'Today', to: 'timetrackyesterday', id: 'today-timetracking-perspective'},
    {txt: 'Last 7 days', to: 'last7daystimetrack', id: 'last 7 days-timetracking-perspective'},
  ]" 
  :middle="[
    {type: 'Link Group', title: 'Reminders', links: [
    ]},
  ]" 
  :bottom="[]"
  ></icon-section>
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
