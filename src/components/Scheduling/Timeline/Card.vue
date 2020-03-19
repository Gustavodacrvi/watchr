<template>
  <div
    class="Card"

    :style="{top: top + 'px', drag}"

    @mousedown.prevent="mousedown"
  >
    <div v-if="drag && translateY"
      class="card-wrapper fake"
      :style="{height: height + 'px'}"
    ></div>
    <div class="card-wrapper shadow"
      :style="{height: height + 'px', transform: `translateY(${translateY}px)`}"
    >
      {{ name }} {{ drag }}
    </div>
  </div>
</template>

<script>

import mixin from "@/mixins/scheduler.js"

export default {
  mixins: [mixin],
  props: ['name', 'time', 'duration', 'id', 'timelineHeight'],
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
    convertMinToOffset(height, min) {
      return height * min / 1440
    },
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
      this.translateY += num
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
        const res = this.round(5, y - this.dragStartY)

        if ((res + this.top <= 0))
          this.translateY = -this.top
        else if (res >= this.timelineHeight)
          this.translateY = this.timelineHeight
        else
          this.translateY = res
          
      }
    },
    mouseup(evt) {
      this.drag = false
      this.translateY = 0
      this.removeScroll()

      window.removeEventListener('mousemove', this.mousemove)
      window.removeEventListener('mouseup', this.mouseup)
    },
  },
  computed: {
    top() {
      return this.convertMinToOffset(this.timelineHeight, this.getFullTimeMin)
    },
    height() {
      return this.convertMinToOffset(this.timelineHeight, this.getFullDurationMin)
    },
    getFullDurationMin() {
      return this.getFullMin(this.duration)
    },
    getFullTimeMin() {
      return this.getFullMin(this.time)
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

.drag, .drag .card-wrapper {
  z-index: 20 !important;
  background-color: red !important;
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

</style>
