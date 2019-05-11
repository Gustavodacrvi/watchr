<template>
  <div id='navigation'>
    <desk-icon ico='home' txt='fdsafds'></desk-icon>
    <desk-icon ico='tasks'></desk-icon>
    <desk-icon ico='calendar'></desk-icon>
    <desk-icon ico='stopwatch'></desk-icon>
    <desk-icon ico='stream'></desk-icon>
    <desk-icon ico='tags'></desk-icon>
    <desk-icon ico='chart-pie'></desk-icon>
    <desk-icon ico='cog'></desk-icon>
    <desk-icon ico='info'></desk-icon>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Icon from './Desktop-icon.vue';

export default Vue.extend({
  components: {
    'desk-icon': Icon,
  },
});
</script>

<style scoped>

#navigation {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 87px;
  display: flex;
  flex-direction: column;
}

</style>
