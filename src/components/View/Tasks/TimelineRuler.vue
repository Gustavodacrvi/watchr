<template>
  <transition
    appear

    name='trans'
  >
    <div
      class="TimelineRuler"

      @click.stop
      @pointerup.stop
      @mouseup.stop
      @touchend.stop.passive
    >
      <span v-if="getNewValue" class="save">Save</span>
      <div
        class="wrapper"
        ref='wrapper'

        @mousedown='mousedown'
        @mouseup='mouseup'
      >
        <transition name='fade-t'>
          <div v-if="handleY" class="handle" :style="{top: handleY + 'px'}"></div>
        </transition>
      </div>
      <div v-if="getNewValue" class="time">
        <span v-if="isPositive">+</span>
        <span v-else>-</span>
        {{ getTime }}
      </div>
    </div>
  </transition>
</template>

<script>

import schedulerMixin from '@/mixins/scheduler.js'

import utils from "@/utils"

export default {
  mixins: [schedulerMixin],
  data() {
    return {
      handleY: null,
      dragStart: null,
      lastValue: 0,
    }
  },
  mounted() {
    window.addEventListener('mousemove', this.mousemove)
  },
  beforeDestroy() {
    window.removeEventListener('mousemove', this.mousemove)
  },
  methods: {
    mousemove(evt) {
      const path = event.path || (event.composedPath && event.composedPath())
      let found
      for (const node of path)
        if (node === this.$refs.wrapper) {
          found = true
          break
        }
      
      if (found)
        this.handleY = this.round(5, evt.clientY - this.offsetTop)
      else this.handleY = null
    },
    mousedown(evt) {
      this.dragStart = evt.clientY - this.offsetTop
    },
    mouseup(evt) {
      this.lastValue = this.getNewValue
      this.dragStart = null
    },
  },
  computed: {
    offsetTop() {
      return this.$el.getBoundingClientRect().top
    },
    isPositive() {
      return this.getNewValue > 0
    },
    getNewValue() {
      if (!this.dragStart)
        return this.lastValue
      return this.lastValue - (this.dragStart - this.handleY)
    },
    getTime() {
      return utils.formatQuantity(
        this.formatMin(
          this.round(5,
              this.convertOffsetToMin(Math.abs(this.getNewValue), 3000)
          ),
          false
        )
      )
    },
  },
}

</script>

<style scoped>

.TimelineRuler {
  position: absolute;
  left: 0;
  top: 0;
  width: 50px;
  height: 100%;
  border: 5px solid var(--purple);
  border-top: 0 solid transparent;
  border-bottom: 0 solid transparent;
  background-color: rgba(161, 96, 235, .05);
  z-index: 3;
}

.wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  cursor: grab;
}

.handle {
  background-color: var(--purple);
  border-radius: 8px;
  width: 75%;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  height: 10px;
}

.time {
  position: absolute;
  top: 0;
  right: 52px;
  white-space: nowrap;
}

.save {
  width: 50px;
  left: -5px;
  cursor: pointer;
  display: inline-flex;
  position: absolute;
  justify-content: center;
  align-items: center;
  background-color: var(--extra-light-gray);
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  height: 25px;
  text-align: center;
  bottom: 100%;
  transition-duration: .2s;
}

.save:hover {
  background-color: var(--purple);
  color: white;
}

.trans-enter, .trans-leave-to {
  transition-duration: .15s;
  transform: scaleX(2);
  border: 0px solid var(--purple);
  opacity: 0;
}

.trans-leave, .trans-enter-to {
  transition-duration: .15s;
  transform: scaleX(1);
  border: 5px solid var(--purple);
  opacity: 1;
}

.trans-leave-active, .trans-enter-active {
  border-top: 0 solid transparent;
  border-bottom: 0 solid transparent;
}

.trans-leave-active .time, .trans-enter-active .time,
.trans-leave-active .save, .trans-enter-active .save {
  display: none;
}

</style>
