<template>
  <div v-if='routine' class='routine card-round' :class='$store.state.theme.style'>
    <div class='routine-header'>
      <app-title :no-margin='true' :inline='true' :lvl='3'>{{ routine.name }}</app-title>
      <div class='options'>
        <icon-group class='icon-group' handle='stopwatch' :options="[
          { ico: 'folder-plus', dbclick: false, title: 'Add existing interval', callback: () => console.log(3)},
          { ico: 'pen', dbclick: false, title: 'Create interval', callback: () => console.log('d') },
        ]"></icon-group>
        <icon-group class='icon-group' handle='ellipsis-v' :options="[
          { ico: 'clone', dblclick: false, title: 'Clone routine', callback: () => console.log('dbclick') },
          { ico: 'calendar-minus', dblclick: true, title: 'Remove routine from today', color: 'red', callback: () => console.log('dbclick') },
          { ico: 'trash', dblclick: true, title: 'Delete routine', color: 'red', callback: () => console.log('dbclick') },
        ]"></icon-group>
      </div>
    </div>
    <div class='intervals'>
      <div class='intervals-line'></div>
    </div>
  </div>
  <div v-else class='routine no-routine' :class='$store.state.theme.style'>
    <div>
      <span>There are no routines today</span>
      <div class='routine-icons'>
        <icon class='pointer' sz='big-big' ico='folder-plus' title='Add bind existing routine'></icon>
        <icon class='pointer' sz='big-big' ico='pen' title='Create routine'></icon>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Routine } from '@/components/interfaces';
import Heading from '@/components/generalComponents/Heading.vue';
import Icon from '@/components/generalComponents/Icon.vue';
import IconGroup from '@/components/dropdown/IconGroup.vue';

export default Vue.extend({
  components: {
    'icon': Icon,
    'app-title': Heading,
    'icon-group': IconGroup,
  },
  props: {
    'routine-id': String,
  },
  beforeCreate() {
    this.$store.commit('app/addRoutine', {
      id: 'id',
      name: 'Weekends',
      intervals: [],
      visibilityField: [
        'every day',
      ],
    } as Routine);
  },
  data() {
    return {
      routine: this.$store.getters['app/getRoutine']('id'),
    };
  },
});
</script>

<style scoped>

.no-routine.light {
  background-color: #e9e4e2;
}

.no-routine.dark {
  background-color: #1C1C1C;
}

.routine {
  height: 100px;
  padding: 14px;
  padding-bottom: 6px;
  display: flex;
  flex-direction: column;
}

.routine-icons {
  display: flex;
  justify-content: center;
  margin-top: 6px;
}

.routine-icons .icon {
  margin: 4px;
}

.no-routine {
  border-style: dashed;
  border-radius: 12px;
  color: #ADADAD;
  display: flex;
  justify-content: center;
  align-items: center;
}

.options {
  float: right;
  clear: right;
}

.icon-group {
  margin: 4px;
}

.intervals {
  position: relative;
  height: 100%;
  overflow: auto;
}

.intervals::-webkit-scrollbar {
  height: 5px;
}
 
.intervals::-webkit-scrollbar-thumb {
  background-color: #A97CFC;
  border-radius: 12px;
}

.intervals-line {
  position: absolute;
  top: 40%;
  transform: translateY(-50%);
  height: 15px;
  width: 1457px;
  border-radius: 12px;
  background-color: #F1F1F3;
}

</style>
