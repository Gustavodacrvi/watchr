<template>
  <div class="CalendarPicker">
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
  </div>
</template>

<script>

import IconVue from '../../Icon.vue'
import mom from 'moment'

export default {
  components: {
    Icon: IconVue,
  },
  data() {
    return {
      visualMoment: mom(),
      originalMoment: mom(),
      selectedMoment: mom(),
    }
  },
  methods: {
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
      const calendar = {
        type: 'specific',
        editDate: mom().format('Y-M-D'),
        specific: m.format('Y-M-D'),
        time: null,
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
      return this.visualMoment.clone().date(day).isSame(this.selectedMoment)
    },
  },
}

</script>

<style scoped>

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
