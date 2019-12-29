<template>
  <div class="PomoClock" :class="platform">
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

import mom from 'moment/src/moment'

import { mapGetters } from 'vuex'

export default {
  props: ['total', 'current', 'color', 'shadow'],
  methods: {
    getValueFromTime(time) {
      const split = time.split(':')
      
      const hour = parseInt(split[0], 10)
      const sec = parseInt(split[1], 10)

      return sec + (hour * 60)
    },
  },
  computed: {
    ...mapGetters(['platform']),
    dasharray() {
      return 252 * this.currentValue / this.totalValue
    },
    currentValue() {
      return this.getValueFromTime(this.current)
    },
    totalValue() {
      return this.getValueFromTime(this.total)
    },
    getTime() {
      const diff = this.totalValue - this.currentValue

      return mom(`${diff / 60}:${diff % 60}`, 'mm:ss').format('mm:ss')
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
