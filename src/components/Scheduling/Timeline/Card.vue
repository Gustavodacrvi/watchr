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

      translateY: 0,

      dragStartY: null,
      bounderyTimeout: null,

      dataTime: this.time,
      dataDuration: this.duration,

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
      if ((num + this.top <= 0))
        num = -this.top
      else if (num >= this.timelineHeight)
        num = this.timelineHeight
      
      this.translateY = num
    },
    mousemove(evt) {
      evt.preventDefault()
        if (this.drag) {
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

        this.translate(res)
        
        this.$emit('dragging', {
          id: this.task.id,
          time: this.newNonFormatedTime,
        })
      }
    },
    mouseup(evt) {
      this.drag = false
      this.removeScroll()
      this.saveData()
      this.translate(0)

      window.removeEventListener('mousemove', this.mousemove)
      window.removeEventListener('mouseup', this.mouseup)
    },

    async saveData() {
      this.dataTime = this.newNonFormatedTime

      try {
        await this.$store.dispatch('task/saveTask', {
          id: this.task.id,
          calendar: {
            time: this.dataTime
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
    newNonFormatedTime() {
      return this.formatMin(
        this.convertOffsetToMin(this.top + this.translateY, this.timelineHeight), false,
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
