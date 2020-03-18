<template>
  <div class="Calendar">
    <div class="header">
      <div class="current-date">
        {{ currentYear }} {{ currentMonth }}
      </div>
      <div>
        <Icon
          class="arrow-left icon cursor primary-hover"
          icon="tiny-arrow"
          width="20px"
          @click="previousMonth"
        />
        <Icon
          class="icon cursor primary-hover"
          icon="tiny-circle"
          width="14px"
          @click="resetDate"
          style='transform: translateY(-2px)'
        />
        <Icon
          class="arrow-right primary-hover cursor"
          icon="tiny-arrow"
          width="20px"
          @click="nextMonth"
        />
      </div>
    </div>
    <div class="grid">
      <div class='week-day' key='s'>S</div>
      <div class='week-day' key='m'>M</div>
      <div class='week-day' key='t'>T</div>
      <div class='week-day' key='w'>W</div>
      <div class='week-day' key='tu'>T</div>
      <div class='week-day' key='f'>F</div>
      <div class='week-day' key='sa'>S</div>

      <div v-for="i in firstWeekDayRange" :key="i" class="day dead"></div>
      <div v-for="i in daysInMonth" :key="i + 'num'" class='day num' :class="{active: selectedDay === i}" @click="selectDate(i)">{{ i }}</div>
    </div>
  </div>
</template>

<script>

import mom from 'moment'

const TOD = mom()
const TOD_STR = TOD.format('Y-M-D')

export default {
  props: ['value'],
  data() {
    return {
      current: this.defaultDate || TOD_STR,
      selected: this.defaultDate || TOD_STR,
    }
  },
  methods: {
    selectDate(day) {
      this.saveDate(this.currentMoment.clone().date(day).format('Y-M-D'))
    },
    previousMonth() {
      this.current = this.currentMoment.clone().subtract(1, 'month').format('Y-M-D')
    },
    nextMonth() {
      this.current = this.currentMoment.clone().add(1, 'month').format('Y-M-D')
    },
    resetDate() {
      this.current = this.initial || TOD_STR
    },
    saveDate(date) {
      this.selected = date
      this.$emit('input', date)
    },
  },
  computed: {
    firstWeekDayRange() {
      return parseInt(this.currentMoment.clone().startOf('month').format('d'), 10)
    },
    selectedDay() {
      if (
        !this.currentMoment.isSame(this.selectedMoment, 'month') ||
        !this.currentMoment.isSame(this.selectedMoment, 'year')
      )
        return false
      return parseInt(this.selectedMoment.format('D'), 10)
    },
    daysInMonth() {
      return this.currentMoment.daysInMonth()
    },
    currentYear() {
      return this.currentMoment.format('YYYY')
    },
    currentMonth() {
      return this.currentMoment.format('MMM')
    },
    selectedMoment() {
      return mom(this.selected, 'Y-M-D')
    },
    currentMoment() {
      return mom(this.current, 'Y-M-D')
    },
  },
  watch: {
    current() {
      setTimeout(() => {
        this.$emit('calc')
      })
    },
    value() {
      let reset
      if (this.selected !== this.value)
        reset = true
      this.selected = this.value

      if (reset)
        this.resetDate()
    },
  },
}

</script>

<style scoped>

.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.arrow-left {
  margin-right: 8px;
  transform: rotate(90deg);
}

.arrow-right {
  margin-left: 8px;
  transform: rotate(-90deg);
}

.current-date {
  font-size: 1.2em;
  color: var(--primary);
}

.grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: 25px;
}

.week-day, .day {
  display: flex;
  justify-content: center;
  align-items: center;
}

.week-day {
  color: var(--fade);
  font-size: .9em;
}

.day {
  border-radius: 8px;
  transition-duration: .2s;
  font-size: 1.1em;
}

.num:hover, .num.active {
  background-color: var(--primary);
  user-select: none;
  color: var(--dark-void);
}

</style>
