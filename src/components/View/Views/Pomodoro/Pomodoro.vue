<template>
  <div class="Pomodoro">
    <PomoClock/>
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
