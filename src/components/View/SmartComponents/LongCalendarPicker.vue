<template>
  <transition
    appear
    :css="false"
    @enter='enter'
    @leave='leave'
  >
    <div class="LongCalendarPicker" :class="[layout, {helper}]"
      @scroll.prevent
      @whell.prevent
      @touchmove.stop.prevent='touchmove'
      @touchstart.stop.passive='touchstart'
      @touchend.stop.passive='touchend'
    >
      <div v-show="!helper" class="ball" ref="ball" :style="{left}"></div>
      <div class="wrapper" ref="wrapper">
        <div class="week-view last-week" ref="last-week">
          <div v-for="d in lastWeekDates" :key="d.date"
            class="date-wrapper"
            :class="{active: d.day === activeDay, notActive: d.day !== activeDay, tod: todayDay === d.day}"
            :ref="d.date"
            @click="desktopSelect(d.date)"
            @touchend='mobileSelect(d.date)'
          >
            <div class="weekday" :class="{'has-task': hasTaskInDate(d.date)}">
              {{ d.weekday }}
            </div>
            <div class="day-wrapper cursor remove-highlight">
              <span class="day">
                {{ d.day }}
              </span>
            </div>
          </div>
        </div>
        <div class="week-view this-week" ref='this-week'>
          <div v-for="d in thisWeekDates" :key="d.date"
            class="date-wrapper"
            :class="{active: d.day === activeDay, notActive: d.day !== activeDay}"
            :ref="d.date"
            @click="desktopSelect(d.date)"
            @touchend='mobileSelect(d.date)'
          >
            <div class="weekday" :class="{'has-task': hasTaskInDate(d.date)}">
              {{ d.weekday }}
            </div>
            <div class="day-wrapper cursor remove-highlight">
              <span class="day">
                {{ d.day }}
              </span>
            </div>
          </div>
        </div>
        <div class="week-view next-week" ref="next-week">
          <div v-for="d in nextWeekDates" :key="d.date"
            class="date-wrapper"
            :class="{active: d.day === activeDay}"
            :ref="d.date"
            @click="desktopSelect(d.date)"
            @touchend='mobileSelect(d.date)'
          >
            <div class="weekday" :class="{'has-task': hasTaskInDate(d.date)}">
              {{ d.weekday }}
            </div>
            <div class="day-wrapper cursor remove-highlight">
              <span class="day">
                {{ d.day }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div v-show="!helper" class="header">
        <span class="title">{{ title }}</span>
      </div>

      <div v-if="isDesktopBreakPoint"
        class="btn shadow right-btn cursor"
        @click="swipeRight"
      >
        <Icon class="icon"
          icon='tiny-arrow'
          width='25px'
        />
      </div>
      <div v-if="isDesktopBreakPoint"
        class="btn shadow left-btn cursor"
        @click="swipeLeft"
      >
        <Icon class="icon"
          icon='tiny-arrow'
          width='25px'
        />
      </div>
    </div>
  </transition>
</template>

<script>

import mom from 'moment'

import utils from "@/utils/"

import { mapGetters, mapState } from 'vuex'

const TOD = mom()
const TOD_STR = TOD.format('Y-M-D')

export default {
  props: ['helper'],
  data() {
    return {
      active: TOD_STR,
      weekStart: TOD.clone().startOf('week').format('Y-M-D'),
      left: 0,

      startTime: 0,
      startX: 0,

      doingTransition: false,
      moved: false,
      savedSelected: [],
    }
  },
  created() {
    this.select(TOD_STR)
  },
  mounted() {
    this.fixWidth()
    this.moveBall()

    window.addEventListener('resize', this.fixWidth)
    window.addEventListener('resize', this.moveBall)

    const ball = this.$refs['ball'].style
    setTimeout(() => {
      ball.transitionDuration = '.15s'
    }, 1000)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.fixWidth)
    window.removeEventListener('resize', this.moveBall)
  },
  methods: {
    enter(root) {
      const r = root.style
      const w = this.$refs['wrapper'].style

      const rHeight = root.offsetHeight
      const wHeight = this.$refs['wrapper'].offsetHeight

      r.transitionDuration = '0'
      w.transitionDuration = '0'

      r.margin = 0
      r.height = 0
      r.opacity = 0
      w.height = 0

      requestAnimationFrame(() => {
        r.transitionDuration = '.15s'
        w.transitionDuration = '.15s'

        r.margin = '8px 0'
        r.opacity = 1
        r.height = rHeight + 'px'
        w.height = wHeight + 'px'
      })
    },
    leave(root) {
      const r = root.style
      const w = this.$refs['wrapper'].style

      r.transitionDuration = '.15s'
      w.transitionDuration = '.15s'

      r.margin = 0
      r.height = 0
      r.opacity = 0
      w.height = 0
    },
    hasTaskInDate(date) {
      return this.tasks.some(task =>
        this.isTaskShowingOnDate(task, date)
      )
    },
    fixWidth() {
      const el = this.$refs['wrapper']
      el.scrollLeft = el.scrollWidth * (1 / 3)
    },
    touchstart(evt) {
      this.startTime = new Date()
      const touch = evt.touches[0]
      this.startX = touch.pageX
      this.moved = false
    },
    touchmove(evt) {
      const touch = evt.touches[0]
      const newPos = touch.pageX
      this.diff = newPos - this.startX

      const move = Math.abs(this.startX - newPos) > 10 
      if (move) this.moved = true

      const t = this.$refs['this-week'].style
      const l = this.$refs['last-week'].style
      const n = this.$refs['next-week'].style
      const ball = this.$refs['ball'].style

      t.transitionDuration = '0s'
      l.transitionDuration = '0s'
      n.transitionDuration = '0s'
      ball.transitionDuration = '0s'

      t.transform = `translateX(${this.diff}px)`
      l.transform = `translateX(${this.diff}px)`
      n.transform = `translateX(${this.diff}px)`
      ball.transform = `translateX(${this.diff}px)`
    },
    touchend(evt) {
      const time = new Date() - this.startTime

      const width = this.$refs['wrapper'].clientWidth

      let runTransition = true
      const diff = Math.abs(this.diff)

        if ((diff > (width / 2)) || ((time < 250) && (diff > 5))) {
        runTransition = false
        if (this.diff > 0) {
          this.swipeLeft()
        } else {
          this.swipeRight()
        }
      }

      this.diff = 0
      
      const ball = this.$refs['ball'].style
      if (runTransition) {
        const t = this.$refs['this-week'].style
        const l = this.$refs['last-week'].style
        const n = this.$refs['next-week'].style
  
        t.transitionDuration = '.4s'
        l.transitionDuration = '.4s'
        n.transitionDuration = '.4s'
        ball.transitionDuration = '.4s'
  
        requestAnimationFrame(() => {
          t.transform = `translateX(0px)`
          l.transform = `translateX(0px)`
          n.transform = `translateX(0px)`
          ball.transform = `translateX(0px)`
        })
      } else {
        ball.transform = `translateX(0px)`
        ball.opacity = 0
      }
    },
    
    moveBall() {
      requestAnimationFrame(() => {
        const ball = this.$refs['ball'].style
        ball.opacity = 1
        const el = this.$refs[this.active][0]

        this.left = el.offsetLeft + 'px'
      })
    },
    desktopSelect(date) {
      if (this.isDesktopBreakPoint) this.select(date)
    },
    mobileSelect(date) {
      if (!this.moved) this.select(date)
    },
    select(date) {
      if (this.savedSelected.length === 0 || this.helper) {
        this.active = date
        this.$emit('select', date)
      } else this.saveDates(date)
    },
    saveDates(date) {
      this.$store.dispatch('task/saveTasksById', {
        ids: this.savedSelected,
        task: {
          calendar: {
            type: 'specific',
            begins: date,
            editDate: TOD_STR,
            specific: date,
          }
        },
      })
    },
    swipeLeft() {
      if (!this.doingTransition) {
        this.doingTransition = true
        const width = this.$refs['wrapper'].clientWidth
        const t = this.$refs['this-week'].style
        const n = this.$refs['last-week'].style
        const ball = this.$refs['ball'].style
  
        t.transitionDuration = '.4s'
        n.transitionDuration = '.4s'
  
        ball.opacity = 0
        this.left = 0
  
        t.transform = `translateX(${width}px)`
        n.transform = `translateX(${width}px)`
  
        setTimeout(() => {
          t.transitionDuration = '0s'
          n.transitionDuration = '0s'
          this.weekStart = this.lastWeek
          this.select(this.weekStart)
          t.transform = `translateX(0px)`
          n.transform = `translateX(0px)`
          ball.opacity = 1
          this.doingTransition = false
        }, 610)
      }
    },
    swipeRight() {
      if (!this.doingTransition) {
        this.doingTransition = true
        const width = this.$refs['wrapper'].clientWidth
        const t = this.$refs['this-week'].style
        const n = this.$refs['next-week'].style
        const ball = this.$refs['ball'].style
  
        t.transitionDuration = '.4s'
        n.transitionDuration = '.4s'
  
        ball.opacity = 0
        this.left = 0
  
        t.transform = `translateX(-${width}px)`
        n.transform = `translateX(-${width}px)`
  
        setTimeout(() => {
          t.transitionDuration = '0s'
          n.transitionDuration = '0s'
          this.weekStart = this.nextWeek
          this.select(this.weekStart)
          t.transform = `translateX(0px)`
          n.transform = `translateX(0px)`
          ball.opacity = 1
          this.doingTransition = false
        }, 610)
      }
    },
    getWeekDates(weekStart) {
      const date = mom(weekStart, 'Y-M-D')

      const arr = []
      for (let i = 0;i < 7;i++) {
        arr.push({
          date: date.format('Y-M-D'),
          day: date.format('D'),
          weekday: date.format('ddd'),
        })
        date.add(1, 'd')
      }
      return arr
    },
  },
  computed: {
    ...mapState({
      selectedItems: state => state.selectedItems,
    }),
    ...mapGetters({
      tasks: 'task/tasks',
      isDesktopBreakPoint: 'isDesktopBreakPoint',
      layout: 'layout',
      isTaskShowingOnDate: 'task/isTaskShowingOnDate',
    }),
    title() {
      return utils.getHumanReadableDate(this.active)
    },
    todayDay() {
      return mom(TOD_STR, 'Y-M-D').format('D')
    },
    mom() {
      return mom(this.active, 'Y-M-D')
    },
    activeDay() {
      return mom(this.active, 'Y-M-D').format('D')
    },
    lastWeek() {
      return mom(this.weekStart, 'Y-M-D').subtract(1, 'week').startOf('week').format('Y-M-D')
    },
    nextWeek() {
      return mom(this.weekStart, 'Y-M-D').add(1, 'week').startOf('week').format('Y-M-D')
    },
    lastWeekDates() {
      return this.getWeekDates(this.lastWeek)
    },
    thisWeekDates() {
      return this.getWeekDates(this.weekStart)
    },
    nextWeekDates() {
      return this.getWeekDates(this.nextWeek)
    },
  },
  watch: {
    active() {
      this.moveBall()
    },
    selectedItems() {
      setTimeout(() => {
        this.savedSelected = [...this.selectedItems]
      }, 10)
    },
  }
}

</script>

<style scoped>

.LongCalendarPicker {
  position: relative;
  overflow: visible;
  margin: 8px 0;
}

.wrapper {
  position: relative;
  width: 100%;
  height: 80px;
  overflow: hidden;
}

.title {
  font-size: 1.4em;
  color: var(--purple);
  text-shadow: 0 0 40px rgba(161, 96, 235, .4);
}

.header {
  position: relative;
  height: 30px;
  display: flex;
  align-items: center;
  padding-left: 14px;
}

.mobile .header {
  padding-left: 9px;
}

.btn {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  transform: translateY(-50%);
  top: 50%;
  background-color: var(--card);
  width: 30px;
  height: 30px;
  border-radius: 1000px;
  overflow: hidden;
  transition-duration: .15s;
}

.btn:hover {
  background-color: var(--light-gray);
}

.right-btn {
  right: -35px;
}

.right-btn .icon {
  transform: rotate(-90deg) translateY(2px);
}

.left-btn {
  left: -35px;
}

.left-btn .icon {
  transform: rotate(90deg) translateY(3px);
}

.week-view {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-around;
  transform: translateX(0px);
  transition-timing-function: ease-out;
  transition-duration: .6s;
}

.mobile .week-view {
  justify-content: space-between;
}

.date-wrapper {
  height: 100%;
  display: flex;
  justify-content: space-around;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.weekday {
  font-size: .8em;
  opacity: .4;
}

.weekday.has-task {
  color: white !important;
  opacity: 1;
}

.day-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.3em;
  position: relative;
  width: 45px;
  height: 45px;
  border-radius: 1000px;
  overflow: hidden;
  transition-duration: .15s;
}

.mobile .day-wrapper {
  font-size: 1.2em;
}

.ball {
  width: 45px;
  height: 45px;
  border-radius: 1000px;
  background-color: var(--purple);
  box-shadow: 0 0 28px rgba(161, 96, 235, .4);
  position: absolute;
  top: 30px;
  transition-timing-function: ease-out;
}

.date-wrapper.active .day-wrapper {
  color: white !important;
}


.date-wrapper.active .day-wrapper {
  color: var(--primary);
}

.helper .date-wrapper.active .day-wrapper {
  color: var(--txt) !important;
}

.desktop .day-wrapper.notActive:hover {
  background-color: var(--card);
  box-shadow: 0 3px 8px rgba(15,15,15,.3);
}

.last-week {
  left: 0;
}

.this-week {
  left: 100%;
}

.next-week {
  left: 200%;
}

</style>
