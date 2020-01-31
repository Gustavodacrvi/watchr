<template>
  <div class="CalendarPicker">
    <div key="calendar" class="view calendar">
      <div class="fast-options">
        <Icon class="icon option-icon cursor primary-hover" width="24px" icon="star" @click="today"/>
        <Icon class="icon option-icon cursor primary-hover" width="24px" icon="sun" @click="tomorrow"/>
        <Icon v-if="!onlyDates" class="icon option-icon cursor primary-hover" width="24px" icon="archive" @click="someday"/>
        <Icon v-if="!onlyDates || allowNull" class="icon option-icon cursor primary-hover" width="24px" icon="bloqued" @click="noDate"/>
        <Icon v-if="repeat && !onlyDates" class="icon option-icon cursor primary-hover" width="24px" icon="repeat" @click="$emit('repeat')"/>
      </div>
      <div v-if="!noTime" class="opt cursor remove-highlight rb" @click='$emit("get-time", selectedMoment.format("Y-M-D"))'>
        <span class="msg">Time: {{ getTime }}</span>
        <CircleBubble
          innerColor='rgba(87,160,222,.1)'
          outerColor='var(--primary)'
        />
      </div>
      <div class="cont">
        <div class="header">
          <h3 class="year">{{ thisYear() }}   {{ thisMonth() }}</h3>
          <div class="icons">
            <Icon class="arrow-right icon cursor primary-hover" icon="arrow" width="18px" @click="previousMonth"/>
            <Icon class="icon cursor primary-hover" icon="tiny-circle" width="14px" @click="resetDate" style='transform: translateY(0px)'/>
            <Icon class="primary-hover arrow-left icon cursor" icon="arrow" width="18px" @click="nextMonth"/>
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
          <span v-for='i in firstWeekDayRange()' :key='i + 100' class="dark-date"></span>
          <span v-for="i in monthDays()" :key="i" class="day cursor rb"
            :class="{active: isSelectedDate(i)}"
            @click="selectDate(i)"
          >
            <span class="number">{{ i }}</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import IconVue from '../../Icon.vue'
import ButtonVue from '@/components/Auth/Button.vue'
import TagVue from '@/components/View/Tag.vue'

import mom from 'moment'
import { mapGetters, mapState } from 'vuex'

import utils from '@/utils'

export default {
  props: ['repeat', 'onlyDates', 'defaultTime', 'initial', 'noTime', 'allowNull'],
  components: {
    Icon: IconVue,
    Button: ButtonVue,
    Tag: TagVue,
  },
  data() {
    return {
      visualMoment: this.initalDate ? mom(this.initalDate, 'Y-M-D') : mom(),
      originalMoment: this.initalDate ? mom(this.initalDate, 'Y-M-D') : mom(),
      selectedMoment: this.initalDate ? mom(this.initalDate, 'Y-M-D') : mom(),
      time: null,
      calendarObj: null,
    }
  },
  created() {
    if (this.defaultTime)
      this.time = this.defaultTime
  },
  computed: {
    ...mapState(['userInfo']),
    calendarStr() {
      if (this.calendarObj)
        return utils.parseCalendarObjectToString(this.calendarObj, this.userInfo)
      return null
    },
    getTime() {
      if (this.time) {
        if (this.userInfo.disablePmFormat)
          return this.time
        return mom(this.time, 'H:m').format('h:m A')
      }
      return 'No time'
    },
  },
  methods: {
    keydown({key}) {
      if (key === "Enter")
        this.$emit('select', this.calendarObj)
    },
    noDate() {
      if (this.allowNull && this.onlyDates)
        this.$emit('select', {specific: null})
      else
        this.$emit('select', null)
    },
    today() {
      this.select(this.selectedMoment.clone())
    },
    tomorrow() {
      this.select(this.selectedMoment.clone().add(1, 'd'))
    },
    someday() {
      let time = null
      if (this.time) time = this.time
      const calendar = {
        time,
        type: 'someday',
        editDate: mom().format('Y-M-D'),
        begins: mom().format('Y-M-D'),
      }
      this.$emit('select', calendar)
    },
    select(m) {
      let time = null
      if (this.time) time = this.time
      const calendar = {
        time,
        type: 'specific',
        editDate: mom().format('Y-M-D'),
        specific: m.format('Y-M-D'),
        begins: mom().format('Y-M-D'),
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
      setTimeout(() => {
        this.$emit('calc')
      }, 50)
      this.$forceUpdate()
    },
    previousMonth() {
      setTimeout(() => {
        this.$emit('calc')
      }, 50)
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
    firstWeekDayRange() {
      const clone = this.visualMoment.clone()
      const num = parseInt(clone.startOf('month').format('d'), 10)
      const arr = []
      for (let i = 1; i <= num; i++)
        arr.push(i)
      return arr
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

.opt {
  margin: 0 26px;
  height: 38px;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
  transition-duration: .2s;
}

.opt:hover {
  background-color: rgba(87,160,222,.1); 
  color: var(--primary);
}

.opt .msg {
  margin-left: 8px;
}

.fast-options {
  height: 50px;
  display: flex;
  align-items: center;
  margin-left: 26px;
}

.option-icon {
  margin-right: 12px;
}

.time-comp {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  height: 100%;
}

.time {
  height: 350px;
  width: 225px !important;
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

.input {
  width: 100%;
  box-sizing: border-box;
  background: none;
  border: none;
  border-radius: 0;
  font-size: 1em;
  padding: 8px;
  outline: none;
  border-bottom: 1px solid var(--fade);
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
  width: 275px;
  transition-duration: .15s;
}

.time-wrapper:hover {
  background-color: var(--light-gray);
}

.back-arrow {
  transform: rotate(90deg);
}

.view, .left, .right {
  transition-duration: .15s;
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
  width: 275px;
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

.cont {
  margin: 0 26px;
}

.weeks {
  display: flex;
  justify-content: space-around;
  margin: 6px 0;
  transform: translateX(-3px);
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

.dark-date {
  display: inline-block;
  width: 31px;
  height: 18px;
}

.day {
  width: 31px;
  height: 31px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition-duration: .15s;
}

.number {
  transition-duration: .15s;
}

.active {
  background-color: var(--light-gray);
  color: var(--primary);
}

</style>
