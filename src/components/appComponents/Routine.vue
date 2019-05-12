<template>
  <div class='routine card-round' :class='$store.state.theme.style'>
      {{ routine }}
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Routine } from '@/components/interfaces';

export default Vue.extend({
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
}

</style>
