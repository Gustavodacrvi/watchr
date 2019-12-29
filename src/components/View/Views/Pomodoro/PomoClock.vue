<template>
  <div class="PomoClock">
    <div class="wrapper">
      <svg viewBox='0 0 100 100' width='300px' height='300px' class="svg drop-black">
        <circle ref='circle' class="back-pie" stroke-width="2px" cx="50%" cy="50%" r="40"/>
      </svg>
      <svg viewBox='0 0 100 100' width='300px' height='300px' class="svg drop-red">
        <circle ref='circle' class="pie" stroke-width="2px" cx="50%" cy="50%" r="40" :stroke-dasharray='`${dasharray} 300`'/>
      </svg>
    </div>
  </div>
</template>

<script>

// 252

export default {
  props: ['total', 'current'],
  methods: {
    getValueFromTime(time) {
      const split = time.split(':')
      
      const hour = parseInt(split[0], 10)
      const sec = parseInt(split[1], 10)

      return sec + (hour * 60)
    },
  },
  computed: {
    dasharray() {
      return 252 * this.currentValue / this.totalValue
    },
    currentValue() {
      return this.getValueFromTime(this.current)
    },
    totalValue() {
      return this.getValueFromTime(this.total)
    },
  },
}

</script>

<style scoped>

.PomoClock {
  position: absolute;
  width: 100%;
  display: flex;
  justify-content: center;
}

.wrapper {
  display: inline-block;
  position: relative;
  width: 300px;
  height: 300px;
}

.svg {
  position: absolute;
  left: 0;
  top: 0;
}

.drop-red {
  filter: drop-shadow(0 0 18px rgba(234, 58, 52, .8));
}

.drop-black {
  filter: drop-shadow(0 0 18px rgba(31, 31, 31, .4));
}

.back-pie, .pie {
  fill: none;
  transform: rotate(-90deg);
  transform-origin: 50%;
}

.back-pie {
  stroke: var(--card);
}

.pie {
  stroke: var(--dark-red);
}

</style>
