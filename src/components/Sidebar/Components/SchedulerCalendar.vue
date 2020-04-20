<template>
  <div class="SchedulerCalendar">
    <div class="wrapper">
      <div class="weeks">
        <span>S</span>
        <span>M</span>
        <span>T</span>
        <span>W</span>
        <span>T</span>
        <span>F</span>
        <span>S</span>
      </div>
      <div class="grid">
        <div v-for="i in firstWeekDayRange" :key="i + 'empty'"
          class="day fade"
        >
          {{ i }}
        </div>
        <div v-for="i in daysInMonth" :key="i + 'non-empty'"
          class="day active"
          :class="{selected: (selectedDay === i && !(isSameMonthAndSameYearAsTod && selectedDay === todDay))}"
          
          @click="selectDate(i)"
        >
          <Icon v-if="isSameMonthAndSameYearAsTod && todDay === i" :key="i + 'Tod_icon'"
            icon='star'
            color='var(--yellow)'
          />
          <span v-else>
            {{ i }}
          </span>
        </div>
        <div v-for="i in lastWeekDayRange" :key="i + 'empty-last'"
          class="day fade"
        >
          {{ i }}
        </div>
      </div>
      <div class="options">
        <div class="arrow arrow-left"
          @click="goToPreviousMonth"
        >
          <Icon
            icon='arrow'
            width='18px'
          />
        </div>
        <div class="current-date">
          {{ currentYear }} {{ currentMonth }}
        </div>
        <div class="arrow arrow-right"
          @click="goToNextMonth"
        >
          <Icon
            icon='arrow'
            width='18px'
          />
        </div>
      </div>
      <div class="icon-drop">
        <SmartIcon
          v-bind="currentObj"
          trigger='enter'

          :listenToWindow='true'
          :tagMode='true'
          :list='getList'
        />
      </div>
    </div>
  </div>
</template>

<script>

import SmartIcon from '@/components/Icons/SmartIconDrop.vue'
import mom from 'moment'

const TOD = mom()
const TOD_STR = TOD.format('Y-M-D')

export default {
  components: {
    SmartIcon,
  },
  props: ['date'],
  data() {
    return {
      todDate: TOD_STR,
      
      initial: this.date || TOD_STR,
      selected: this.date || TOD_STR,
      current: this.date || TOD_STR,

      currentObj: null,
    }
  },
  created() {
    this.currentObj = this.getList[0]
  },
  methods: {
    goToPreviousMonth() {
      this.current = this.previousMom.format('Y-M-D')
    },
    goToNextMonth() {
      this.current = this.nextMom.format('Y-M-D')
    },
    selectDate(day) {
      this.selected = this.currentMom.clone().date(day).format('Y-M-D')
    },
  },
  computed: {
    getList() {
      const getFinalArr = obj => ({
        ...obj,
        callback: () => ({...obj}),
      })
      
      return [
        {
          id: '1',
          name: 'Inbox',
          icon: 'inbox',
          color: 'var(--primary)',
        },
        {
          id: '2',
          name: 'Anytime',
          icon: 'layer-group',
          color: 'var(--olive)',
        },
        {
          id: '3',
          name: 'Someday',
          icon: 'archive',
          color: 'var(--brown)',
        },
        {
          id: '4',
          name: 'Assigned to me',
          icon: 'group',
          color: 'var(--orange)',
        },
        {
          id: '6',
          name: 'Upcoming',
          icon: 'calendar',
          color: 'var(--green)',
        },
        {
          id: '7',
          name: 'Deadlines',
          icon: 'deadline',
          color: 'var(--red)',
        },
      ].map(getFinalArr)
    },
    
    
    initialMom() {
      return mom(this.initial, 'Y-M-D')
    },
    selectedMom() {
      return mom(this.selected, 'Y-M-D')
    },
    currentMom() {
      return mom(this.current, 'Y-M-D')
    },
    previousMom() {
      return this.currentMom.clone().subtract(1, 'month')
    },
    todMom() {
      return mom(this.todDate, 'Y-M-D')
    },
    isSameMonthAndSameYearAsTod() {
      return this.currentMom.isSame(this.todMom, 'month') &&
        this.currentMom.isSame(this.todMom, 'year')
    },
    isSameMonthAndSameYearAsSelected() {
      return this.currentMom.isSame(this.selectedMom, 'month') &&
        this.currentMom.isSame(this.selectedMom, 'year')
    },
    todDay() {
      return parseInt(this.todMom.format('D'), 10)
    },
    nextMom() {
      return this.currentMom.clone().add(1, 'month')
    },
    daysInPreviousMonth() {
      return this.previousMom.daysInMonth()
    },

    firstWeekDayRange() {
      const numberOfEmptyDays = parseInt(this.currentMom.clone().startOf('month').format('d'), 10)
      const arr = []
      const previousNumber = this.daysInPreviousMonth
      for (let i = 0; (previousNumber - i) > (previousNumber - numberOfEmptyDays);i++) {
        arr.push(previousNumber - i + 1)
      }
      return arr.reverse()
    },
    daysInMonth() {
      return this.currentMom.daysInMonth()
    },
    selectedDay() {
      if (!this.isSameMonthAndSameYearAsSelected)
        return false
      return parseInt(this.selectedMom.format('D'), 10)
    },
    currentYear() {
      return this.currentMom.format('YYYY')
    },
    currentMonth() {
      return this.currentMom.format('MMM')
    },
    lastWeekDayRange() {
      return (this.daysInMonth % 7)
    },
  },
  watch: {
    currentObj() {
      this.$emit('input', this.currentObj)
    },
  },
}

</script>

<style>

.SchedulerCalendar {
  background-color: var(--card);
  box-shadow: 0 1px 2px rgba(0,0,0,.4);
  display: inline-block;
  width: 100%;
  position: relative;
  z-index: 2;
}

.wrapper {
  margin: 10px 0;
}

.weeks {
  display: flex;
  justify-content: space-around;
  align-items: center;
  font-size: .9em;
  opacity: .7;
}

.day {
  height: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
}

.active {
  border-radius: 4px;
  cursor: pointer;
  background-color: none;
  transition-duration: .15s;
}

.options, .icon-drop {
  height: 30px;
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.arrow {
  border: 1px solid transparent;
  color: white;
  padding: 10px 6px;
  border-radius: 4px;
  transition-duration: .2s;
  cursor: pointer;
}

.arrow-left {
  transform: rotate(90deg);
}

.arrow-right {
  transform: rotate(-90deg);
}

.active:hover, .selected, .arrow:hover {
  border: 1px solid var(--purple);
  color: var(--purple);
}

.arrow-left:active {
  transform: rotate(90deg), scale(.95,.95);
}

.fade {
  opacity: .6;
}

.grid {
  margin-top: 6px;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  font-size: 1.02em;
}

</style>
