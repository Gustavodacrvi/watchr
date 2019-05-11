<template>
  <div id='navigation'>
    <desk-icon ico='home' :txt='lang("sectionNavOverview")'></desk-icon>
    <desk-icon ico='tasks' :txt='lang("sectionNavTasks")'></desk-icon>
    <desk-icon ico='stopwatch' :txt='lang("sectionNavIntervals")'></desk-icon>
    <desk-icon ico='stream' :txt='lang("sectionNavRoutines")'></desk-icon>
    <desk-icon ico='tags' :txt='lang("sectionNavTags")'></desk-icon>
    <desk-icon ico='chart-pie' :txt='lang("sectionNavStatistics")'></desk-icon>
    <hr id='navigation-margin'/>
    <desk-icon ico='cog' :txt='lang("sectionNavSettings")'></desk-icon>
    <desk-icon ico='info-circle' :txt='lang("sectionNavHelp")'></desk-icon>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Icon from './Desktop-icon.vue';

export default Vue.extend({
  components: {
    'desk-icon': Icon,
  },
  computed: {
    lang(): string {
      return this.$store.getters['lang/l'];
    },
  },
});
</script>

<style scoped>

#navigation {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 75px;
  display: flex;
  flex-direction: column;
}

#navigation-margin {
  border: none;
  margin-top: 15px;
}

</style>
