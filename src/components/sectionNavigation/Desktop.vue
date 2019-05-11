<template>
  <div id='navigation'>
    <icon class='pointer icon-color-hover' sz='big' ico='home'></icon>
    <icon class='pointer icon-color-hover' sz='big' ico='tasks'></icon>
    <icon class='pointer icon-color-hover' sz='big' ico='calendar'></icon>
    <icon class='pointer icon-color-hover' sz='big' ico='stopwatch'></icon>
    <icon class='pointer icon-color-hover' sz='big' ico='stream'></icon>
    <icon class='pointer icon-color-hover' sz='big' ico='tags'></icon>
    <icon class='pointer icon-color-hover' sz='big' ico='chart-pie'></icon>
    <icon class='pointer icon-color-hover' sz='big' ico='settings'></icon>
    <icon class='pointer icon-color-hover' sz='big' ico='info'></icon>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Icon from './../generalComponents/Icon.vue';

export default Vue.extend({
  components: {
    icon: Icon,
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
