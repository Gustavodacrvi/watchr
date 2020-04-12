<template>
  <div class="DurationScroll">
    <div class="wrapper" ref='wrapper'
      @scroll.prevent.stop='scroll'

      :style="{
        paddingBottom: (numHeight * 2) + 'px',
      }"
    >
      <div v-for="n in max" :key="n"
        class="num"
        :class="{
          active: num === (n - 1),
        }"

        :style="{
          height: numHeight + 'px',
        }"
      >
        {{ parseNum(n - 1) }}
      </div>
    </div>
    <div class="box"></div>
  </div>
</template>

<script>

export default {
  props: ['value', 'max'],
  data() {
    return {
      num: this.value,
      numHeight: 40,

      lastScroll: 0,
    }
  },
  mounted() {
    this.updateScroll()
  },
  methods: {
    updateScroll() {
      this.setScroll(this.num * this.numHeight)
    },
    setScroll(num) {
      if (num === this.max) return;
      this.lastScroll = num
      this.$refs.wrapper.scrollTop = num
    },
    getScroll() {
      return this.$refs.wrapper.scrollTop
    },

    scroll(evt) {
      if (this.getScroll() > (this.numHeight * (this.max - 1)))
        this.setScroll(this.lastScroll)
      if ((this.getScroll() > this.lastScroll) && ((this.num + 1) < this.max))
        this.num++
      else if (this.getScroll() < this.lastScroll && (this.num - 1) >= 0)
        this.num--
    },
    parseNum(num) {
      const str = num + ''
      return str.length >= 2 ? str : '0' + num
    },
  },
  watch: {
    num() {
      this.updateScroll() 
      this.$emit('input', this.parseNum(this.num))
    },
    value() {
      this.num = parseInt(this.value, 10)
    },
  },
}

</script>

<style>

.wrapper::-webkit-scrollbar {
  display: none;
}

</style>

<style scoped>

.DurationScroll {
  position: relative;
}

.label {
  font-size: 1.7em;
  display: flex;
  align-items: center;
  margin-left: 8px;
}

.box {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
  pointer-events: none;

  background:
    linear-gradient(to top,var(--card), transparent 48%),
    linear-gradient(to bottom,var(--card), transparent 48%);
}

.wrapper {
  font-size: 2em;

  padding-top: 55px;
  overflow: auto;
  position: relative;
  z-index: 2;
  height: 100%;
} 

.num {
  display: flex;
  z-index: 1;
  position: relative;
  align-items: center;
  justify-content: center;
  opacity: .8;
  user-select: none;
  cursor: grab;
  transition-duration: .15s;
}

.active {
  color: var(--purple);
}

.num:active {
  cursor: grabbing;
}

</style>
