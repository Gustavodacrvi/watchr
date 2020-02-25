<template>
  <div class="PomoClock" :class="layout">
    <div class="wrapper">
      <svg viewBox='0 0 100 100' width='250px' height='250px' class="svg drop-black">
        <circle ref='circle' class="back-pie" stroke-width="2px" cx="50%" cy="50%" r="40"/>
      </svg>
      <svg viewBox='0 0 100 100' width='250px' height='250px' class="svg drop-red" :style="{filter: `drop-shadow(0 0 18px ${shadow})`}">
        <circle ref='circle' class="pie" stroke-width="2px" cx="50%" cy="50%" r="40" :stroke-dasharray='`${dasharray} 300`' :stroke='color'/>
      </svg>
      <span class="time">{{ getTime }}</span>
    </div>
  </div>
</template>

<script>

import mom from 'moment'

import { mapGetters, mapState } from 'vuex'

export default {
  computed: {
    ...mapState({
      total: state => state.pomo.currentDuration,
      current: state => state.pomo.current,
    }),
    ...mapGetters({
      layout: 'layout',
      color: 'pomo/getPomoColor',
      shadow: 'pomo/getPomoShadow',
      currentValue: 'pomo/currentValue',
      totalValue: 'pomo/totalValue',
      getTime: 'pomo/getTime',
    }),
    dasharray() {
      return 252 * this.currentValue / this.totalValue
    },
  },
}

</script>

<style scoped>

.PomoClock {
  width: 100%;
  height: 375px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.mobile {
  height: 325px;
}

.wrapper {
  display: inline-block;
  position: relative;
  width: 250px;
  height: 250px;
}

.svg {
  position: absolute;
  left: 0;
  top: 0;
}

.drop-black {
  filter: drop-shadow(0 0 18px rgba(31, 31, 31, .4));
}

.back-pie, .pie {
  fill: none;
  transform: rotate(-90deg);
  transform-origin: 50%;
  transition-duration: .4s;
}

.back-pie {
  stroke: var(--card);
}

.time {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%,-50%);
  font-size: 2.4em;
}

</style>
