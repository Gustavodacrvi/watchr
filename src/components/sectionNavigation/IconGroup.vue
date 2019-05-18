<template>
  <div>
    <icon ico='home' :desktop='desktop' :txt='lang("sectionNavOverview")'></icon>
    <icon ico='tasks' :desktop='desktop' :txt='lang("sectionNavTasks")'></icon>
    <icon ico='stopwatch' :desktop='desktop' :txt='lang("sectionNavIntervals")'></icon>
    <icon ico='stream' :desktop='desktop' :txt='lang("sectionNavRoutines")'></icon>
    <icon ico='tags' :desktop='desktop' :txt='lang("sectionNavTags")'></icon>
    <icon ico='chart-pie' :desktop='desktop' :txt='lang("sectionNavStatistics")'></icon>
    <hr v-if='desktop' id='navigation-margin'/>
    <icon ico='cog' :desktop='desktop' :txt='lang("sectionNavSettings")'></icon>
    <icon ico='info-circle' :desktop='desktop' :txt='lang("sectionNavHelp")'></icon>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import NavigationIcon from '@/components/sectionNavigation/NavigationIcon.vue';

export default Vue.extend({
  props: {
    desktop: Boolean,
  },
  components: {
    icon: NavigationIcon,
  },
  computed: {
    lang(): string {
      return this.$store.getters['lang/l'];
    },
  },
});
</script>

<style scoped>

#navigation-margin {
  border: none;
  margin-top: 15px;
}

</style>
