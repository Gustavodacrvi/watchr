<template>
  <div class="Pomodoro">
    <PomoClock
      total='00:50'
      current='00:10'
    />
  </div>  
</template>

<script>

import PomoClock from './PomoClock.vue'

export default {
  components: {
    PomoClock,
  },
}

</script>

<style scoped>

.Pomodoro {
  position: relative;
  width: 100%;
}

</style>
