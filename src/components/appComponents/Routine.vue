<template>
  <div class='routine card-round' :class='$store.state.theme.style'>
    <div class='routine-header'>
      <app-title :no-margin='true' :lvl='3'>{{ routine.name }}</app-title>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Routine } from '@/components/interfaces';
import Heading from '@/components/generalComponents/Heading.vue';

export default Vue.extend({
  components: {
    'app-title': Heading,
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

.routine-header {
  overflow: auto;
}

</style>
