<template>
  <div class='routine card-round' :class='$store.state.theme.style'>
    <div class='routine-header'>
      <app-title :no-margin='true' :inline='true' :lvl='3'>{{ routine.name }}</app-title>
      <icon-group class='options' handle='ellipsis-v' :options="[
        { ico: 'clone', dblclick: false, callback: () => console.log('not dbclick') },
        { ico: 'calendar-minus', dblclick: true, color: 'red', callback: () => console.log('dbclick') },
        { ico: 'trash', dblclick: true, color: 'red', callback: () => console.log('dbclick') },
      ]"></icon-group>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Routine } from '@/components/interfaces';
import Heading from '@/components/generalComponents/Heading.vue';
import IconGroup from '@/components/dropdown/IconGroup.vue';

export default Vue.extend({
  components: {
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

.routine {
  height: 100px;
  padding: 14px;
}

.toggle-section {
  margin-left: 60px;
}

.toggle-text {
  position: relative;
  color: #A97CFC;
  font-size: 1.2em;
  margin: 0 10px;
}

.options {
  float: right;
  clear: right;
}

</style>
