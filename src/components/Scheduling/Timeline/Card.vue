<template>
  <div
    class="Card"
    :class="{drag}"

    :style="{top: top + 'px', zIndex}"

    @mousedown.prevent="mousedown"

    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <div class="card-wrapper">
      <div v-if="drag && translateY"
        class="card fake"
        :style="{height: height + 'px', width}"
      ></div>
      <div class="card shadow"
        :style="{
          height: height + 'px',
          width,
          transform: `translateY(${translateY}px)`,
        }"
      >
        <span class="name">
          {{ name }}
        </span>

        <transition name="pri-t">
          <div v-if="priority" class="priority" :style="{backgroundColor: priorityColor}"></div>
        </transition>
      </div>

      <span v-if="drag || hover"
        class="time"
      >
        {{newTime}}
      </span>
    </div>
  </div>
</template>

<script>

import mixin from "@/mixins/scheduler.js"

import mom from 'moment'

import { mapGetters } from 'vuex'

export default {
  mixins: [mixin],
  props: ['name', 'timeArr', 'time', 'duration', 'id', 'timelineHeight', 'priority', 'task'],
  data() {
    return {
      drag: false,

      translateY: 0,

      dragStartY: null,
      bounderyTimeout: null,

      timeout: null,
      interval: null,

      lastScrollVal: null,
      hover: false,
    }
  },
  methods: {
    getFullMin(str) {
      const split = str.split(':')
      return (parseInt(split[0], 10) * 60) + parseInt(split[1], 10)
    },

    mousedown(evt) {
      this.drag = true
      this.dragStartY = evt.pageY + this.getScrollTop()

      window.addEventListener('mousemove', this.mousemove)
      window.addEventListener('mouseup', this.mouseup)
      
    },
    scroll(num) {
      this.$parent.$parent.$parent.$emit('scroll', num)
      this.translate(this.translateY + num)
    },
    activateScrolling(scroll) {
      if (scroll !== this.lastScrollVal || (!this.timeout && !this.interval)) {
        this.removeScroll()
        this.lastScrollVal = scroll
        this.timeout = setTimeout(() => {
          this.interval = setInterval(() => {
            this.scroll(scroll)
          }, 10)
        }, 200)
      }
    },
    removeScroll() {
      if (this.interval) {
        clearInterval(this.interval)
        this.interval = null
      }
      if (this.timeout) {
        clearInterval(this.timeout)
        this.timeout = null
      }
    },
    getScrollTop() {
      return this.$parent.$parent.$parent.$parent.$el.scrollTop
    },
    translate(num) {
      if ((num + this.top <= 0))
        num = -this.top
      else if (num >= this.timelineHeight)
        num = this.timelineHeight
      
      this.translateY = num
    },
    mousemove(evt) {
      evt.preventDefault()
      const node = document.getElementById('sidebar-scroll')

      const y = evt.pageY + this.getScrollTop()

      const boundery = 60

      if (((node.offsetHeight + this.getScrollTop()) - y) < boundery) {
        this.activateScrolling(10)
      } else if (evt.pageY < boundery) {
        this.activateScrolling(-10)
      } else {
        this.removeScroll()
      }

      if (this.drag) {
        const res = this.convertMinToOffset(
          this.round(5,
            this.convertOffsetToMin(y - this.dragStartY, this.timelineHeight)
          ), this.timelineHeight
        )

        this.translate(res)
      }
    },
    mouseup(evt) {
      this.drag = false
      this.translate(0)
      this.removeScroll()

      window.removeEventListener('mousemove', this.mousemove)
      window.removeEventListener('mouseup', this.mouseup)
    },

    comesBeforeThan(testId) {
      const arr = this.timeArr
      const cardId = this.currentCardTimeAndEnd.id
      
      for (const {id} of arr)
        if (id === cardId)
          return true
        else if (id === testId)
          return false

    },
  },
  computed: {
    ...mapGetters({
      getTaskStartAndEnd: 'task/getTaskStartAndEnd',
    }),
    newTime() {
      return this.formatMin(
        this.convertOffsetToMin(this.top + this.translateY, this.timelineHeight)
      )
    },
    width() {
      return `${100 - (this.getFractionNumber * 15)}%`
    },
    currentCardTimeAndEnd() {
      const {start, end, id} = this.getTaskStartAndEnd(this.task)
      return {
        id,
        start: mom(start, 'HH:mm'),
        end: mom(end, 'HH:mm'),
        strStart: start,
        strEnd: end,
      }
    },
    getFractionNumber() {
      const {start, end, strStart, strEnd, id} = this.currentCardTimeAndEnd // MOMENTJS

      return this.timeArr.reduce((total, taskProperties) => {
        if (taskProperties.id === id)
          return total
        
        const test = {
          end: mom(taskProperties.end, 'HH:mm'),
          start: mom(taskProperties.start, 'HH:mm'),
        }

        const log = moment => {
          console.log(moment.format('HH:mm'))
        }
        

        if (
          start.isBefore(test.end, 'minute') &&
          start.isAfter(test.start, 'minute')
        )
          return total + 1

        if (
          taskProperties.start === strStart &&
          end.isBefore(test.end)
        )
          return total + 1

        if (
          taskProperties.start === strStart &&
          taskProperties.end === strEnd &&
          this.comesBeforeThan(taskProperties.id)
        )
          return total + 1

        return total


      }, 0)
    },
    
    top() {
      return this.convertMinToOffset(this.getFullTimeMin, this.timelineHeight)
    },
    height() {
      return this.convertMinToOffset(this.getFullDurationMin, this.timelineHeight)
    },
    getFullDurationMin() {
      return this.getFullMin(this.duration)
    },
    getFullTimeMin() {
      return this.getFullMin(this.time)
    },
    zIndex() {
      return this.getFractionNumber
    },

    priorityColor() {
      return {
        'Low priority': 'var(--green)',
        'Medium priority': 'var(--yellow)',
        'High priority': 'var(--red)',
      }[this.priority]
    },
  },
}

</script>

<style scoped>


.Card {
  left: 0;
  width: 100%;
  position: absolute;
  z-index: 1;
}

.time {
  position: absolute;
  top: -5px;
  right: calc(100% + 4px);
  white-space: nowrap;
  display: inline-block;
  padding: 8px;
  padding-right: 0;
  color: var(--purple);
  background-color: var(--sidebar-color);
}

.card-wrapper {
  position: relative;
  margin-left: 60px;
}

.card {
  padding: 12px;
  position: absolute;
  right: 0;
  width: 100%;
  box-sizing: border-box;
  border-radius: 8px;
  background-color: var(--card);
  border: 1px solid var(--sidebar-color);
  transition: background-color .2s, width .2s;
  user-select: none;
}

.card:hover {
  background-color: var(--light-gray);
  cursor: grab;
}

.fake {
  opacity: .8;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: -1;
}

.drag {
  z-index: 10000 !important;
}

.name {
  display: block;
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.priority {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 5px;
  transition-duration: .2s;
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
}

.pri-t-enter, .pri-t-leave-to {
  opacity: 0;
  width: 0;
}

.pri-t-leave, .pri-t-enter-to {
  opacity: 1;
  width: 5px;
}

</style>
