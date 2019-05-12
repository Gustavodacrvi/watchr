<template>
  <div class='routine card-round' :class='$store.state.theme.style'>
    <div class='routine-header'>
      <app-title :no-margin='true' :inline='true' :lvl='3'>{{ routine.name }}</app-title>
      <icon-group class='options' handle='ellipsis-v' :options='[
        { ico: "trash", dbclick: false, color: "red" },
        { ico: "calendar-minus", dbclick: true, color: "red" },
        { ico: "clone", dbclick: false },
      ]'></icon-group>
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
  computed: {
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
