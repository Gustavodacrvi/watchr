<template>
  <div class="CalendarPicker">
    <div key="calendar" class="view calendar">
      <div class="input-wrapper">
        <input
          :value="smart"
          class="input"
          autocomplete="off"
          type="text"
          ref='input'
          @input="v => smart = v.target.value"
          @keydown="keydownInput"
        >
      </div>
      <div v-if="!calendar">
        <div class="fast-options">
          <Icon
            class="cursor icon-box"
            width="24px"
            icon="star"
            ref='tod'
            title='Today'
            :box='true'
            :active='selectionPos === 1 && isDesktopBreakPoint'
            @click="today"
          />
          <Icon
            class="cursor icon-box"
            width="24px"
            icon="sun"
            ref='tom'
            title='Tomorrow'
            :box='true'
            :active='selectionPos === 2 && isDesktopBreakPoint'
            @click="tomorrow"
          />
          <Icon v-if="allowSomeday"
            class="cursor icon-box"
            width="24px"
            ref='som'
            icon="archive"
            title='Someday'
            :box='true'
            :active='selectionPos === 3 && isDesktopBreakPoint'
            @click="someday"
          />
          <Icon v-if="allowBloqued"
            class="cursor icon-box"
            ref='bloq'
            width="24px"
            icon="bloqued"
            title='No date'
            :box='true'
            :active='selectionPos === 4 && isDesktopBreakPoint'
            @click="noDate"
          />
          <Icon v-if="allowRepeat"
            class="cursor icon-box"
            ref='rep'
            width="24px"
            icon="repeat"
            title='Recurring dates'
            :box='true'
            :active='selectionPos === 5 && isDesktopBreakPoint'
            @click="$emit('repeat')"
          />
        </div>
        <div v-if="!noTime" class="opt cursor time-option remove-highlight rb" @click='$emit("get-time", selectedMoment.format("Y-M-D"))'>
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
      <div v-else class="calendar-str">
        <Icon class="calendar-icon"
          icon='calendar'
          color='var(--green)'
        />
        <span class="calendar-name">
          {{calendarStr}}
        </span>
      </div>
    </div>
  </div>
</template>

<script>

import ButtonVue from '@/components/Auth/Button.vue'
import TagVue from '@/components/View/Tag.vue'

import mom from 'moment'
import { mapGetters, mapState } from 'vuex'

import utils from '@/utils'

export default {
  props: ['repeat', 'onlyDates', 'defaultTime', 'initial', 'noTime', 'allowNull'],
  components: {
    Button: ButtonVue,
    Tag: TagVue,
  },
  data() {
    return {
      visualMoment: this.initalDate ? mom(this.initalDate, 'Y-M-D') : mom(),
      originalMoment: this.initalDate ? mom(this.initalDate, 'Y-M-D') : mom(),
      selectedMoment: this.initalDate ? mom(this.initalDate, 'Y-M-D') : mom(),
      time: null,
      calendar: null,

      smart: '',

      selectionPos: 0,
    }
  },
  created() {
    if (this.defaultTime)
      this.time = this.defaultTime
  },
  mounted() {
    window.addEventListener('keydown', this.keydown)

    if (this.isDesktopBreakPoint)
      this.focusName()
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.keydown)
  },
  computed: {
    ...mapState(['userInfo', 'isOnShift']),
    ...mapGetters(['isDesktopBreakPoint']),
    allowSomeday() {
      return !this.onlyDates
    },
    allowBloqued() {
      return !this.onlyDates || this.allowNull
    },
    allowRepeat() {
      return this.repeat && !this.onlyDates
    },
    calendarStr() {
      if (!this.calendar)
        return null
      return utils.parseCalendarObjectToString(this.calendar, this.userInfo)
    },
    getTime() {
      if (this.time) {
        if (this.userInfo.disablePmFormat)
          return this.time
        return mom(this.time, 'H:m').format('h:m A')
      }
      return 'No time'
    },
    iconKeyboardActions() {
      const c = ref => () => this.$refs[ref].click()

      const obj = {
        0: () => this.focusName(),
        1: c('tod'),
        2: c('tom'),
      }

      const getLength = () => Object.keys(obj).length

      if (this.allowSomeday)
        obj[getLength()] = c('som')
      
      if (this.allowBloqued)
        obj[getLength()] = c('bloq')

      if (this.allowRepeat)
        obj[getLength()] = c('rep')

      return obj
    },
    keyboardActions() {
      return this.iconKeyboardActions
    },
  },
  methods: {
    keydownInput({key}) {
      if (key === "Enter")
        this.$emit('select', this.calendar)
    },
    focusName() {
      this.$refs.input.focus()
    },
    keydown(evt) {
      const { key } = evt
      const p = () => {
        evt.stopPropagation()
        evt.preventDefault()
      }

      if (key === "ArrowDown") {
        p()

        if (this.isOnShift)
          this.selectionPos = Object.keys(this.keyboardActions).length - 1
        else
          this.increment(1)
      } else if (key === 'ArrowUp') {
        p()

        if (this.isOnShift)
          this.selectionPos = 0
        else
          this.increment(-1)
      }
      else if (key === 'Enter') {
        this.keyboardActions[this.selectionPos]()
      } else if (key === "Escape") {
        this.$emit('close')
      }
    },
    increment(inc) {
      const newIndex = this.selectionPos + inc
      if (this.keyboardActions[newIndex])
        this.selectionPos = newIndex
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
  watch: {
    selectionPos() {
      if (this.selectionPos === 0)
        this.focusName()
      else
        this.$refs.input.blur()
    },
    calendar() {
      setTimeout(() => this.$emit('calc'), 0)
    },
    smart() {
      const n = this.smart

      if (!n) {
        this.calendar = null
        return;
      }

      const res = utils.calendarObjNaturalCalendarInput(' ' + n, this.userInfo.disablePmFormat)
      if (res && res.calendar)
        this.calendar = res.calendar
      else
        this.calendar = null
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

.input-wrapper {
  margin: 0 28px;
  margin-bottom: 4px;
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

.time-option {
  position: relative;
  z-index: 2;
}

.fast-options {
  position: relative;
  z-index: 3;
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

.calendar-str {
  margin: 0 28px;
  margin-top: 18px;
  display: flex;
  align-items: center;
}

.calendar-icon {
  transform: translateY(2px);
}

.calendar-name {
  font-size: 1.1em;
  margin-left: 6px;
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

.active, .day:hover {
  background-color: var(--light-gray);
  color: var(--primary);
}

</style>
