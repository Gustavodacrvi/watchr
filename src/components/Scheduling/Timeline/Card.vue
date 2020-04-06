<template>
  <div
    class="Card"
    :class="{task: !isCalendarEvent, drag, resize, color: getColor, disableTransition}"

    :style="{top: top + 'px', zIndex}"

    @mousedown.prevent="mousedown"
    @touchstart='touchstart'
    @touchmove='elementTouchmove'

    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <div class="card-wrapper">
      <div v-if="drag && translateY"
        class="card fake"
        :style="{height: computedHeight + 'px', width}"
      ></div>
      <div class="card shadow"
        ref='card'
        :style="{
          height: computedHeight + 'px',
          width,
          transform: `translateY(${translateY}px)`,
        }"
      >
        <span class="info-wrapper">
          <span class="name">
            <span class="name">
              <span v-if="!isCalendarEvent"
                class="icon-wrapper"

                @mousedown.stop
                @click.stop='completeTask'
                @contextmenu.stop.prevent='cancelTask'
              >
                <Icon
                  icon='box'
                  :color='priorityColor'
                  :box='true'
                  width='11px'
                />
              </span>
              {{ name }}
            </span>
          </span>
          <span class="info">
            {{formatedTime}} -
            {{newFormatedEnd}}
          </span>
        </span>

        <div v-if="isDesktopDevice" class="resize" :style="{width}"
          @mousedown.prevent.stop='resizeMousedown'
        ></div>

        <transition name="pri-t">
          <div class="priority" :style="{backgroundColor: getColor}"></div>
        </transition>

        <div
          class="card-back-color"
          :style="{backgroundColor: getColor}"
        >

        </div>

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

    'start', 'end', 'color',
    'mainView',
    
    'id', 'timelineHeight', 'priority', 'task'
  ],
  data() {
    return {
      drag: false,
      resize: false,

      translateY: 0,
      expandY: 0,

      dragStartY: null,
      dragStartX: null,
      bounderyTimeout: null,

      dataTime: this.time,
      dataDuration: this.duration,

      disableTransition: false,

      timeout: null,
      interval: null,

      lastScrollVal: null,
      hover: false,

      cancelTouchMove: false,
      enableTimeout: null,
      dragTime: 0,
    }
  },
  mounted() {
    if (this.isDesktopDevice)
      this.bindContextMenu(this.options)
  },
  methods: {
    touchstart(evt) {
      if (!this.isCalendarEvent) {
        this.drag = false
        this.resize = false
        this.cancelTouchMove = false

        this.dragStartY = evt.touches[0].pageY + this.getScrollTop()
        this.dragStartX = evt.touches[0].pageX
        this.dragTime = new Date()

        this.vibrationTimeout = setTimeout(() => {
          window.navigator.vibrate(20)
          this.drag = true
        }, 400)

        window.addEventListener('touchmove', this.touchmove)
        window.addEventListener('touchend', this.touchend)
      }
    },
    elementTouchmove(evt) {
      if (this.drag) evt.preventDefault()
    },
    touchmove(evt) {
      const touch = evt.changedTouches[0]

      const waited = (new Date() - this.dragTime) > 200
      const movedTooFar = (Math.abs(touch.pageY - (this.dragStartY + this.getScrollTop())) > 20) ||
                          (Math.abs(touch.pageX - this.dragStartX) > 20)

      const cancelEvent = movedTooFar && !waited
      if (cancelEvent) {
        clearTimeout(this.vibrationTimeout)
        this.cancelTouchMove = true
      } else if (waited && !this.cancelTouchMove) {
        evt.preventDefault()
        this.handleMove(touch)
      }

    },
    touchend() {
      if (!this.cancelTouchMove) {
        this.drag = false
        this.resize = false
        this.saveData()
        this.removeScroll()
        this.$emit('dragging', null)
        
        this.translate(0)
        this.expand(0)

      }
      window.removeEventListener('touchmove', this.touchmove)
      window.removeEventListener('touchend', this.touchend)
    },
    completeTask() {
      this.$store.dispatch('task/completeTasks', [this.task])
    },
    cancelTask() {
      this.$store.dispatch('task/cancelTasks', [this.task.id])
    },
    bindContextMenu(options) {
      if (!this.isCalendarEvent)
        utils.bindOptionsToEventListener(this.$el, options, this)
    },
    bindEventListeners(evt) {
      this.dragStartY = evt.pageY + this.getScrollTop()

      window.addEventListener('mousemove', this.handleMove)
      window.addEventListener('mouseup', this.mouseup)
    },
    mousedown(evt) {
      if (!this.isCalendarEvent) {
        this.drag = true
        this.resize = false
  
        this.bindEventListeners(evt)      
      }
    },
    resizeMousedown(evt) {
      if (!this.isCalendarEvent) {
        this.drag = false
        this.resize = true
  
        this.bindEventListeners(evt)      
      }
    },
    scroll(num) {
      this.$emit('scroll', num)

      if (this.drag)
        this.translate(this.translateY + num)
      else if (this.resize) this.expand(this.expandY + num)
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
      return this.getScrollingElement.scrollTop
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
    handleMove(evt) {
      if (evt.preventDefault) evt.preventDefault()
      if (this.drag || this.resize) {
        const node = document.getElementById('sidebar-scroll')
        
        const pageY = evt.pageY
        const scrollTop = this.getScrollTop()

        const y = pageY + scrollTop

        const boundery = 60

        if (((node.offsetHeight + scrollTop) - y) < boundery) {
          this.activateScrolling(10)
        } else if (pageY < boundery) {
          this.activateScrolling(-10)
        } else {
          this.removeScroll()
        }

        if (!this.interval) {
          const res = this.convertMinToOffset(
            this.round(5,
              this.convertOffsetToMin(y - this.dragStartY, this.timelineHeight)
            ), this.timelineHeight
          )
  
          if (this.drag)
            this.translate(res)
          else if (this.resize) this.expand(res)
          
          this.$emit('dragging', {
            id: this.id,
            time: this.newNonFormatedTime,
            taskDuration: this.newHeight,
          })
        }
      }
    },
    mouseup(evt) {
      this.drag = false
      this.resize = false
      this.saveData()
      this.removeScroll()
      this.$emit('dragging', null)
      
      this.translate(0)
      this.expand(0)

      window.removeEventListener('mousemove', this.handleMove)
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
          id: this.id,
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
      isDesktopDevice: 'isDesktopDevice',
    }),
    isCalendarEvent() {
      return !this.dataTime && !this.dataDuration
    },
    
    findCollisions() {
      return this.collisions.find(el => this.id === el.target)
    },
    getScrollingElement() {
      if (!this.mainView)
        return this.$parent.$parent.$parent.$parent.$el
      return this.$parent.$parent.$parent.$el
    },
    getCollisions() {
      return this.findCollisions.collisions
    },
    getColor() {
      return this.color || this.findCollisions.color || 'var(--extra-light-gray)'
    },
    options() {
      return this.isCalendarEvent ? [] : utilsTask.taskOptions(this.task, this)
    },
    newNonFormatedTime() {
      if (this.isCalendarEvent)
        return this.start

      const res = this.formatMin(
        this.convertOffsetToMin(this.top + this.translateY, this.timelineHeight), false,
      )
      if (res === '00:04')
        return '00:05'
      
      return res
    },
    newHeight() {
      return this.formatMin(this.newNonFormatedMin, false)
    },
    newNonFormatedMin() {
      return this.round(5, 
          this.convertOffsetToMin(this.computedHeight, this.timelineHeight)
        )
    },
    newFormatedEnd() {
      if (this.isCalendarEvent)
        return this.end
      const split = this.dataDuration.split(':')

      return this.formatTime(
        mom(this.newNonFormatedTime, 'HH:mm')
        .add(this.newNonFormatedMin, 'minute')
      )
    },
    formatedTime() {
      return this.formatTime(this.newNonFormatedTime)
    },
    
    width() {
      return `${100 - (this.getCollisions * 15)}%`
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
      if (!this.isCalendarEvent)
        return this.getFullMin(this.dataDuration)
      
      const split = this.start.split(':')
      
      return this.getFullMin(
            mom(this.end, 'HH:mm')
              .subtract(parseInt(split[0], 10), 'hour')
              .subtract(parseInt(split[1], 10), 'minute')
              .format('HH:mm')
      )
    },
    getFullTimeMin() {
      return this.round(5,
        this.getFullMin(!this.isCalendarEvent ? this.dataTime : this.start)
      )
    },
    zIndex() {
      return this.getCollisions
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
  transform: scale(1,1);
  transition: top .175s, transform .3s;
}

.drag {
  transition: top .175s, transform .3s;
  transform: scale(1.05, 1.05);
}

.disableTransition {
  transition: transform .3s;
}

.info {
  font-size: .95em;
  flex-shrink: 0;
  margin-left: 6px;
}

.name {
  font-size: .95em;
  display: block;
  width: 100%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.icon-wrapper {
  padding: 12px 2px;
  cursor: pointer;
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
  border-radius: 4px;
  /* background-color: var(--card); */
  border: 1px solid var(--sidebar-color);
  box-shadow: 0 0px 0px transparent;
  transition: background-color .175s, width .175s, height .175s, box-shadow .3s;
  user-select: none;
}

.drag .card {
  box-shadow: 0 4px 14px rgba(10,10,10,.3) !important;
}

.resize .card, .drag .card {
  transition: background-color .175s, width .175s;
}

.resize {
  position: absolute;
  bottom: -1px;
  left: 0;
  height: 10px;
  cursor: n-resize;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
}

.task .card:hover {
  /* background-color: var(--light-gray); */
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
  transition-duration: .175s;
  border-top-left-radius: 6px;
  border-bottom-left-radius: 6px;
}

.pri-t-enter, .pri-t-leave-to {
  opacity: 0;
  width: 0;
}

.pri-t-leave, .pri-t-enter-to {
  opacity: 1;
  width: 5px;
}

.color .card {
  box-shadow: none;
  color: white;
  cursor: unset;
}

.card-back-color {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  border-radius: 4px;
  opacity: .4;
  transition-duration: .175s;
}

.card:hover .card-back-color {
  opacity: 1;
}

.mainView {
  background-color: var(--card);
}

.mainView .card {
  border: 1px solid var(--card);
}

</style>
