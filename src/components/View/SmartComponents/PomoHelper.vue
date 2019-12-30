<template>
  <div class="PomoHelper">
    <div class="progress-line">
      <div class="line" :style='{width, backgroundColor: color}'></div>
    </div>
    <div class="cont">
      <div class="top">
        <div>
          <span class="time">{{ getTime }}</span>
        </div>
        <div>
          <Squares class="tiny"/>
        </div>
      </div>
      <div class="bottom">
        <div>
          bottom left
        </div>
        <div>
          bottom rigth
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import Squares from './../Views/Pomodoro/Squares.vue'

import { mapState, mapGetters } from 'vuex'

export default {
  components: {
    Squares,
  },
  computed: {
    ...mapState({
      total: state => state.pomo.currentDuration,
      current: state => state.pomo.current,
    }),
    ...mapGetters({
      platform: 'platform',
      color: 'pomo/getPomoColor',
      shadow: 'pomo/getPomoShadow',
      currentValue: 'pomo/currentValue',
      totalValue: 'pomo/totalValue',
      getTime: 'pomo/getTime',
      taskMsg: 'pomo/taskMsg',
    }),
    width() {
      return (100 * this.currentValue / this.totalValue) + '%'
    },
  }
}

</script>

<style scoped>

.PomoHelper {
  height: 90px;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
}

.progress-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  border-radius: 16px;
  overflow: hidden;
  background-color: var(--void);
}

.line {
  height: 100%;
  transition-duration: .3s;
}

.cont {
  padding: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  height: 100%;
}

.top, .bottom {
  flex-basis: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.time {
  font-size: 1.4em;
}

</style>
