<template>
  <div>
    <app-title :lvl='1'>Today</app-title>
    <routine id='' @interval-selected='selectInterval'></routine>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Routine from '@/components/appComponents/Routine.vue';
import Title from '@/components/appComponents/Title.vue';

export default Vue.extend({
  components: {
    'routine': Routine,
    'app-title': Title,
  },
  data() {
    return {
      interval: undefined as string | undefined,
    };
  },
  methods: {
    selectInterval(id: string) {
      this.interval = id;
    },
  },
});
</script>

<style scoped>

.perspective {
  margin-top: -25px;
}

</style>
