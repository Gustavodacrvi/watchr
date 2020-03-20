<template>
  <div
    class="Card"
    :class="{drag}"

    :style="{top: top + 'px'}"

    @mousedown.prevent="mousedown"
  >
    <div v-if="drag && translateY"
      class="card-wrapper fake"
      :style="{height: height + 'px'}"
    ></div>
    <div class="card-wrapper shadow"
      :style="{
        height: height + 'px',
        transform: `translateY(${translateY}px)`,
      }"
    >
      <span v-if="drag"
        class="time"
      >
        {{newTime}}
      </span>
      {{ name }}


    </div>
  </div>
</template>

<script>

import mixin from "@/mixins/scheduler.js"

export default {
  mixins: [mixin],
  props: ['name', 'time', 'duration', 'id', 'timelineHeight', 'priority'],
  data() {
    return {
      drag: false,

      translateY: 0,

      dragStartY: null,
      bounderyTimeout: null,

      timeout: null,
      interval: null,

      lastScrollVal: null,
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
  },
  computed: {
    newTime() {
      return this.formatMin(
        this.convertOffsetToMin(this.top + this.translateY, this.timelineHeight)
      )
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
  right: calc(100% + 4px);
  white-space: nowrap;
  display: inline-block;
  padding: 8px;
  padding-right: 0;
  color: var(--purple);
  background-color: var(--sidebar-color);
}

.card-wrapper {
  padding: 12px;
  margin-left: 60px;
  border-radius: 8px;
  background-color: var(--card);
  transition: background-color .2s;
}

.card-wrapper:hover {
  background-color: var(--light-gray);
}

.fake {
  opacity: .8;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: -1;
}

.drag {
  z-index: 2;
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
