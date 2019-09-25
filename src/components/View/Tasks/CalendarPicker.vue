<template>
  <div class="CalendarPicker">
    <transition name="cal-trans"
      @enter="enter"
      @leave="leave"
    >
      <div v-if="calendar" key="calendar" class="view calendar">
        <span class="option" @click="today">
          <span class="cont">
            <Icon class="icon" icon="star"/>
            <span class="name">Today</span>
          </span>
        </span>
        <span class="option" @click="tomorrow">
          <span class="cont">
            <Icon class="icon" icon="sun"/>
            <span class="name">Tomorrow</span>
          </span>
        </span>
        <span class="option" @click="noDate">
          <span class="cont">
            <Icon class="icon" icon="bloqued"/>
            <span class="name">No date</span>
          </span>
        </span>
        <div class="content">
          <div class="header">
            <h3 class="year">{{ thisYear() }}   {{ thisMonth() }}</h3>
            <div class="icons">
              <Icon class="arrow-left icon cursor" icon="arrow" width="18px" :primaryHover="true" @click="nextMonth"/>
              <Icon class="icon circle cursor" icon="tiny-circle" width="18px" :primaryHover="true" @click="resetDate"/>
              <Icon class="arrow-right icon cursor" icon="arrow" width="18px" :primaryHover="true" @click="previousMonth"/>
            </div>
          </div>
          <div class="weeks">
            <span class="week">S</span>
            <span class="week">M</span>
            <span class="week">T</span>
            <span class="week">W</span>
            <span class="week">T</span>
            <span class="week">F</span>
            <span class="week">S</span>
          </div>
          <div class="dates">
            <span v-for="i in monthDays()" :key="i" class="day rb"
              :class="{active: isSelectedDate(i)}"
              @click="selectDate(i)"
            >
              <span class="number">{{ i }}</span>
            </span>
          </div>
        </div>
        <span class="option" @click="calendar = false">
          <span class="cont">
            <span v-if="!time" class="name">Add time</span>
            <span v-else class="name">At: {{ time }}</span>
          </span>
        </span>
      </div>
      <div v-else class="time view content" key="time">
        <Icon @click="calendar = true" class="back-arrow cursor" icon="arrow" :primaryHover="true"/>
        <div class="time-comp">
          <div class="time-selector">
            <div class="select-time">
              <span class="time-wrapper rb" @click="increaseHour">
                <Icon icon="tiny-arrow" class="icon cursor top time-icon" width="75px" :primaryHover="true"/>
              </span>
              <span class="time-wrapper rb" @click="increaseMinutes">
                <Icon icon="tiny-arrow" class="icon cursor top time-icon" width="75px" :primaryHover="true"/>
              </span>
            </div>
            <div class="select-time">
              <span class="date">
                {{ hour() }}
              </span>
              <span class="date">
                {{ minutes() }}
              </span>
            </div>
            <div class="select-time">
              <span class="time-wrapper rb" @click="decreaseHour">
                <Icon icon="tiny-arrow" class="icon cursor time-icon bottom" width="75px" :primaryHover="true"/>
              </span>
              <span class="time-wrapper rb" @click="decreaseMinutes">
                <Icon icon="tiny-arrow" class="icon cursor time-icon bottom" width="75px" :primaryHover="true"/>
              </span>
            </div>
          </div>
          <div class="buttons">
            <Button class="btn-time" value="Add time" @click="addTime"/>
            <Button class="btn-time" value="Remove time" @click="removeTime"/>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>

import IconVue from '../../Icon.vue'
import ButtonVue from '@/components/Auth/Button.vue'

import mom from 'moment'

export default {
  components: {
    Icon: IconVue,
    Button: ButtonVue,
  },
  data() {
    return {
      calendar: true,
      visualMoment: mom(),
      originalMoment: mom(),
      selectedMoment: mom(),
      time: null,
    }
  },
  methods: {
    leave(el) {
      if (this.calendar) {
        el.classList.add('right')
      } else {
        el.classList.add('left')
      }
    },
    enter(el) {
      el.style.transitionDuration = '.0s'
      if (this.calendar) {
        el.classList.add('left')
      } else {
        el.classList.add('right')
      }
      setTimeout(() => {
        el.style.transitionDuration = '.3s'
        el.classList.remove('left')
        el.classList.remove('right')
      })
    },
    noDate() {
      this.$emit('select', null)
    },
    today() {
      this.select(this.selectedMoment.clone())
    },
    tomorrow() {
      this.select(this.selectedMoment.clone().add(1, 'd'))
    },
    select(m) {
      let time = null
      if (this.time) time = this.time
      const calendar = {
        time,
        type: 'specific',
        editDate: mom().format('Y-M-D'),
        specific: m.format('Y-M-D'),
        weekly: null,
        periodic: {
          interval: null,
          lastCompleteDate: null
        }
      }
      this.$emit('select', calendar)
    },
    selectDate(day) {
      this.selectedMoment = this.visualMoment.clone().date(day)
      this.$forceUpdate()
      this.select(this.selectedMoment.clone())
    },
    nextMonth() {
      this.visualMoment.add(1, 'M')
      this.$forceUpdate()
    },
    previousMonth() {
      this.visualMoment.subtract(1, 'M')
      this.$forceUpdate()
    },
    resetDate() {
      this.selectedMoment = this.originalMoment.clone()
      this.visualMoment = this.originalMoment.clone()
    },
    increaseHour() {
      const clone = this.selectedMoment.clone()
      if (clone.format('H') === '23') {
        this.selectedMoment.hour(0)
      } else {
        this.selectedMoment.add(1, 'hour')
      }
      this.$forceUpdate()
    },
    decreaseHour() {
      const mom = this.selectedMoment
      const clone = mom.clone()
      if (clone.format('H') === '0') {
        mom.hour(23)
      } else {
        mom.subtract(1, 'hour')
      }
      this.$forceUpdate()
    },
    increaseMinutes() {
      const mom = this.selectedMoment
      const clone = mom.clone()
      if (clone.format('m') === '59') {
        mom.minutes(0)
      } else {
        mom.add(1, 'minute')
      }
      this.$forceUpdate()
    },
    decreaseMinutes() {
      const mom = this.selectedMoment
      const clone = mom.clone()
      if (clone.format('m') === '0') {
        mom.minutes(59)
      } else {
        mom.subtract(1, 'minute')
      }
      this.$forceUpdate()
    },
    addTime() {
      this.calendar = true
      this.time = this.selectedMoment.format('H:m')
    },
    removeTime() {
      this.calendar = true
      this.time = null
    },
    hour() {
      return this.selectedMoment.format('H') 
    },
    minutes() {
      return this.selectedMoment.format('m')
    },
    thisYear() {
      return this.visualMoment.format('YYYY')
    },
    thisMonth() {
      return this.visualMoment.format('MMM')
    },
    monthDays() {
      const arr = []
      const days = this.visualMoment.daysInMonth()
      for (let i = 1; i <= days; i++)
        arr.push(i)
      return arr
    },
    isSelectedDate(day) {
      return this.visualMoment.clone().date(day).isSame(this.selectedMoment, 'day')
    },
  },
}

</script>

<style scoped>

.time-comp {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  height: 100%;
}

.time {
  height: 100%;
}

.time-selector {
  margin: 40px 0;
}

.btn-time {
  margin: 8px 0;
}

.date {
  font-size: 1.5em;
  transform: translateX(-2px);
}

.select-time {
  width: 100%;
  display: flex;
  justify-content: space-around;
}

.time-icon {
  position: relative;
  left: 5px;
  margin-top: -20px;
}

.bottom {
  margin-top: -15px;
}

.top {
  transform: rotate(180deg);
}

.time-wrapper {
  flex-basis: 50px;
  height: 50px;
  transition-duration: .2s;
}

.time-wrapper:hover {
  background-color: var(--light-gray);
}

.back-arrow {
  transform: rotate(90deg);
}

.view, .left, .right {
  transition-duration: .2s;
}

.view {
  opacity: 1;
  transform: translateX(0px);
}

.left {
  opacity: 0;
  transform: translateX(-100px);
}

.right {
  opacity: 0;
  transform: translateX(100px);
}

.cal-trans-enter-active, .cal-trans-leave-active {
  position: absolute;
  width: 100%;
}

.CalendarPicker {
  width: 275px;
}

.year {
  margin: 0;
  color: var(--primary);
}

.arrow-left {
  transform: rotate(-90deg);
}

.arrow-right {
  transform: rotate(90deg);
}

.circle {
  transform: translateY(4px);
}

.option {
  display: flex;
  align-items: center;
  height: 35px;
  white-space: nowrap;
  transition-duration: .3s;
  cursor: pointer;
}

.option:hover {
  color: var(--primary);
  background-color: rgba(87,160,222,.1);
}

.cont {
  height: 100%;
  display: flex;
  margin: 0 26px;
  align-items: center;
  justify-content: center;
}

.content {
  margin: 0 26px;
}

.weeks {
  display: flex;
  justify-content: space-around;
  margin: 6px 0;
}

.week {
  font-size: .8em;
  opacity: .7;
}

.icon {
  position: relative;
  margin-right: 8px;
  bottom: -1.5px;
}

.header {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin: 10px 0;
  overflow: hidden;
}

.day {
  width: 31px;
  height: 31px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition-duration: .2s;
}

.number {
  transition-duration: .2s;
}

.active {
  background-color: var(--light-gray);
  color: var(--primary);
}

</style>
