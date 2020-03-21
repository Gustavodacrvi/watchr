<template>
  <div
    class="Card"
    :class="{drag, resize, disableTransition}"

    :style="{top: top + 'px', zIndex}"

    @mousedown.prevent="mousedown"

    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <div class="card-wrapper">
      <div v-if="drag && translateY"
        class="card fake"
        :style="{height: computedHeight + 'px', width}"
      ></div>
      <div class="card shadow"
        :style="{
          height: computedHeight + 'px',
          width,
          transform: `translateY(${translateY}px)`,
        }"
      >
        <span class="info-wrapper">
          <span class="name">
            <span class="name">
              {{ name }}
            </span>
          </span>
          <span class="info">
            {{formatedTime}} -
            {{newFormatedEnd}}
          </span>
        </span>

        <div class="resize" :style="{width}"
          @mousedown.prevent.stop='resizeMousedown'
        ></div>

        <transition name="pri-t">
          <div v-if="priority" class="priority" :style="{backgroundColor: priorityColor}"></div>
        </transition>

      </div>
    </div>
  </div>
</template>

<script>

import mixin from "@/mixins/scheduler.js"

import mom from 'moment'

import utils from '@/utils/'
import utilsTask from '@/utils/task'

import { mapGetters } from 'vuex'

export default {
  mixins: [mixin],
  props: ['name', 'collisions',
    'time', 'duration',
    
    'id', 'timelineHeight', 'priority', 'task'
  ],
  data() {
    return {
      drag: false,
      resize: false,

      translateY: 0,
      expandY: 0,

      dragStartY: null,
      bounderyTimeout: null,

      dataTime: this.time,
      dataDuration: this.duration,

      disableTransition: false,

      timeout: null,
      interval: null,

      lastScrollVal: null,
      hover: false,
    }
  },
  mounted() {
    if (this.isDesktopDevice)
      this.bindContextMenu(this.options)
  },
  methods: {
    bindContextMenu(options) {
      utils.bindOptionsToEventListener(this.$el, options, this)
    },
    bindEventListeners(evt) {
      this.dragStartY = evt.pageY + this.getScrollTop()

      window.addEventListener('mousemove', this.mousemove)
      window.addEventListener('mouseup', this.mouseup)
    },
    mousedown(evt) {
      this.drag = true
      this.resize = false

      this.bindEventListeners(evt)      
    },
    resizeMousedown(evt) {
      this.drag = false
      this.resize = true

      this.bindEventListeners(evt)      
    },
    scroll(num) {
      this.$parent.$parent.$parent.$emit('scroll', num)

      if (this.drag)
        this.translate(this.translateY + num)
      else this.expand(this.expandY + num)
    },
    activateScrolling(scroll) {
      if (scroll !== this.lastScrollVal || (!this.dataTimeout && !this.interval)) {
        this.removeScroll()
        this.lastScrollVal = scroll
        this.dataTimeout = setTimeout(() => {
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
      if (this.dataTimeout) {
        clearInterval(this.dataTimeout)
        this.dataTimeout = null
      }
    },
    getScrollTop() {
      return this.$parent.$parent.$parent.$parent.$el.scrollTop
    },
    translate(num) {
      if (num + this.top <= 0)
        num = -this.top
      else if ((num + this.top + this.height) >= this.timelineHeight)
        num = this.timelineHeight - this.height - this.top

      this.translateY = num
    },
    expand(num) {
      const min = this.convertMinToOffset(5, this.timelineHeight)
      if (num + this.height <= min)
        num = -this.height + min
      else if ((num + this.top + this.height) >= this.timelineHeight)
        num = this.timelineHeight - this.height - this.top

      this.expandY = num
    },
    mousemove(evt) {
      evt.preventDefault()
      if (this.drag || this.resize) {
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

        const res = this.convertMinToOffset(
          this.round(5,
            this.convertOffsetToMin(y - this.dragStartY, this.timelineHeight)
          ), this.timelineHeight
        )

        if (this.drag)
          this.translate(res)
        else this.expand(res)
        
        this.$emit('dragging', {
          id: this.task.id,
          time: this.newNonFormatedTime,
          taskDuration: this.newHeight,
        })
      }
    },
    mouseup(evt) {
      this.drag = false
      this.resize = false
      this.removeScroll()
      this.saveData()
      this.$emit('dragging', null)
      
      this.translate(0)
      this.expand(0)

      window.removeEventListener('mousemove', this.mousemove)
      window.removeEventListener('mouseup', this.mouseup)
    },

    async saveData() {
      this.disableTransition = true
      setTimeout(() => {
        this.disableTransition = false
      }, 200)
      
      this.dataTime = this.newNonFormatedTime
      this.dataDuration = this.newHeight

      try {
        await this.$store.dispatch('task/saveTask', {
          id: this.task.id,
          taskDuration: this.dataDuration,
          calendar: {
            time: this.dataTime,
          },
        })
      } catch (arr) {
        this.dataTime = this.time
      }
    },
  },
  computed: {
    ...mapGetters({
      getTaskStartAndEnd: 'task/getTaskStartAndEnd',
    }),
    options() {
      return utilsTask.taskOptions(this.task, this)
    },
    newNonFormatedTime() {
      return this.formatMin(
        this.convertOffsetToMin(this.top + this.translateY, this.timelineHeight), false,
      )
    },
    newHeight() {
      return this.formatMin(
        this.convertOffsetToMin(this.computedHeight, this.timelineHeight), false
      )
    },
    newFormatedEnd() {
      const split = this.dataDuration.split(':')

      return this.formatTime(
        mom(this.newNonFormatedTime, 'HH:mm')
        .add(parseInt(split[0], 10), 'hour')
        .add(parseInt(split[1], 10), 'minute')
        .format('HH:mm')
      )
    },
    formatedTime() {
      return this.formatTime(this.newNonFormatedTime)
    },
    
    width() {
      return `${100 - (this.collisions * 15)}%`
    },
    
    currentCardTimeAndEnd() {
      const {start, end, id} = this.getTaskStartAndEnd({
        ...this.task,
        calendar: {
          ...this.task.calendar,
          time: this.newNonFormatedTime || this.time,
        },
      })
      return {
        id,
        start: mom(start, 'HH:mm'),
        end: mom(end, 'HH:mm'),
        strStart: start,
        strEnd: end,
      }
    },
    
    top() {
      return this.convertMinToOffset(this.getFullTimeMin, this.timelineHeight)
    },
    computedHeight() {
      return this.height + this.expandY
    },
    height() {
      return this.convertMinToOffset(this.getFullDurationMin, this.timelineHeight)
    },
    getFullDurationMin() {
      return this.getFullMin(this.dataDuration)
    },
    getFullTimeMin() {
      return this.getFullMin(this.dataTime)
    },
    zIndex() {
      return this.collisions
    },

    priorityColor() {
      return {
        'Low priority': 'var(--green)',
        'Medium priority': 'var(--yellow)',
        'High priority': 'var(--red)',
      }[this.priority]
    },
  },
  watch: {
    options() {
      this.bindContextMenu(this.options)
    },
    time() {
      this.dataTime = this.time
    },
    duration() {
      this.dataDuration = this.duration
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
  transition: top .2s;
}

.disableTransition {
  transition: none;
}

.drag .info {
  color: var(--purple);
}

.info {
  font-size: .9em;
  flex-shrink: 0;
  margin-left: 6px;
}

.name {
  font-size: .9em;
  display: block;
  width: 100%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.info-wrapper {
  display: flex;
  justify-content: space-between;
}

.card-wrapper {
  position: relative;
  box-sizing: border-box;
  margin-left: 60px;
}

.card {
  padding: 4px;
  position: absolute;
  right: 0;
  width: 100%;
  box-sizing: border-box;
  border-radius: 8px;
  background-color: var(--card);
  border: 1px solid var(--sidebar-color);
  transition: background-color .2s, width .2s, height .2s;
  user-select: none;
}

.resize .card, .drag .card {
  transition: background-color .2s, width .2s;
}

.resize {
  position: absolute;
  bottom: -1px;
  left: 0;
  height: 10px;
  cursor: n-resize;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}

.card:hover {
  background-color: var(--light-gray);
  cursor: grab;
}

.card:active {
  cursor: grabbing;
}

.fake {
  opacity: .8;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: -1;
}

.drag, .resize {
  z-index: 10000 !important;
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

.mainView {
  background-color: var(--card);
}

.mainView .card {
  box-shadow: 0 4px 6px rgba(20,20,20,.3);
  border: 1px solid var(--card);
  background-color: var(--dark-light-gray);
}

.mainView .card:hover {
  background-color: var(--light-gray);
}

</style>
