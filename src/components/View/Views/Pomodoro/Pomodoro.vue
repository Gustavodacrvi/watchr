<template>
  <div class="Pomodoro">
    <PomoClock
      total='00:50'
      current='00:10'
    />
    <div class="squares">
      <Square :check='true'/>
      <Square/>
      <Square/>
      <Square/>
    </div>
  </div>  
</template>

<script>

import PomoClock from './PomoClock.vue'
import Square from './Square.vue'

export default {
  components: {
    PomoClock,
    Square,
  },
}

</script>

<style scoped>

.Pomodoro {
  position: absolute;
  width: 100%;
  height: 100%;
  flex-basis: 1000px;
}

.squares {
  margin-top: 14px;
}

</style>
