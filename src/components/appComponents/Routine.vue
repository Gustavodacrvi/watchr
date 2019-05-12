<template>
  <div class='routine card-round' :class='$store.state.theme.style'>
      routine
  </div>
</template>

<script lang="ts">
import Vue from 'vue';


export default Vue.extend({
  props: {
    'routine-id': String,
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
