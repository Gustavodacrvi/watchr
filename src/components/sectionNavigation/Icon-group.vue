<template>
  <div>
    <icon ico='home' :showtext='desktop' :txt='lang("sectionNavOverview")'></icon>
    <icon ico='tasks' :showtext='desktop' :txt='lang("sectionNavTasks")'></icon>
    <icon ico='stopwatch' :showtext='desktop' :txt='lang("sectionNavIntervals")'></icon>
    <icon ico='stream' :showtext='desktop' :txt='lang("sectionNavRoutines")'></icon>
    <icon ico='tags' :showtext='desktop' :txt='lang("sectionNavTags")'></icon>
    <icon ico='chart-pie' :showtext='desktop' :txt='lang("sectionNavStatistics")'></icon>
    <hr v-if='desktop' id='navigation-margin'/>
    <icon ico='cog' :showtext='desktop' :txt='lang("sectionNavSettings")'></icon>
    <icon ico='info-circle' :showtext='desktop' :txt='lang("sectionNavHelp")'></icon>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import NavigationIcon from './Navigation-icon.vue';

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
