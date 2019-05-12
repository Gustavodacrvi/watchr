<template>
  <div>
    <icon ico='home' :txt='lang("sectionNavOverview")'></icon>
    <icon ico='tasks' :txt='lang("sectionNavTasks")'></icon>
    <icon ico='stopwatch' :txt='lang("sectionNavIntervals")'></icon>
    <icon ico='stream' :txt='lang("sectionNavRoutines")'></icon>
    <icon ico='tags' :txt='lang("sectionNavTags")'></icon>
    <icon ico='chart-pie' :txt='lang("sectionNavStatistics")'></icon>
    <hr id='navigation-margin'/>
    <icon ico='cog' :txt='lang("sectionNavSettings")'></icon>
    <icon ico='info-circle' :txt='lang("sectionNavHelp")'></icon>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import NavigationIcon from './Navigation-icon.vue';

export default Vue.extend({
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
