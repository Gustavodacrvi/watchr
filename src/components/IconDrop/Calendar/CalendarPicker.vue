<template>
  <div class="CalendarPicker">
    <SearchInput
      placeholder='Smart input...'
      :focus='true'
    />
    <div class="fast-icons">
      <Icon
        class="cursor icon-box"
        width="22px"
        icon="star"
        color='var(--yellow)'
        ref='tod'
        title='Today'
        :box='true'
      />
      <Icon
        class="cursor icon-box"
        width="22px"
        icon="sun"
        color='var(--orange)'
        ref='tom'
        title='Tomorrow'
        :box='true'
      />
      <Icon v-if="allowSomeday"
        class="cursor icon-box"
        width="22px"
        ref='som'
        icon="archive"
        color='var(--brown)'
        title='Someday'
        :box='true'
      />
      <Icon v-if="allowSomeday"
        class="cursor icon-box"
        width="22px"
        ref='any'
        color='var(--olive)'
        icon="layer-group"
        title='Anytime'
        :box='true'
      />
      <Icon v-if="allowBloqued"
        class="cursor icon-box"
        ref='bloq'
        width="22px"
        icon="bloqued"
        color='var(--red)'
        title='No date'
        :box='true'
      />
      <Icon v-if="allowRepeat"
        class="cursor icon-box"
        ref='rep'
        width="22px"
        icon="repeat"
        title='Recurring dates'
        :box='true'
      />
    </div>
    <div class="calendar-wrapper">
      <div class="header">
        <div class="current-date">
          {{ currentYear }} {{ currentMonth }}
        </div>
        <div class="icons">
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
    <ButtonInput
      :value='getTime ? getTime : "Add time"'
      icon='clock'
      :defaultColor='getTime ? "var(--purple)" : ""'
      @click.native="addTime"
    />
    <ButtonInput
      value='Save date'
      icon='calendar'
      defaultColor='var(--green)'
      @click.native="saveDate"
    />
  </div>
</template>

<script>

import SearchInput from '../Components/SearchInput.vue'
import ButtonInput from '../Components/Button.vue'

import mom from 'moment'

const TOD = mom()
const TOD_STR = TOD.format('Y-M-D')

export default {
  components: {
    SearchInput,
    ButtonInput,
  },
  props: ['repeat', 'onlyDates', 'defaultTime', 'initial', 'noTime', 'allowNull'],
  data() {
    return {
      current: this.initial || TOD_STR,
      selected: this.initial || TOD_STR,

      time: this.defaultTime || null,
    }
  },
  methods: {
    addTime() {
      this.$emit("get-time", this.selected)
    },
    saveDate() {
      this.$emit('select', this.calendar || {
        time: this.item,
        type: 'specific',
        editDate: TOD.format('Y-M-D'),
        specific: this.selectedMoment.format('Y-M-D'),
        begins: TOD.format('Y-M-D'),
      })
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
    selectDate(day) {
      this.selected = this.selectedMoment.clone().date(day)
    },
  },
  computed: {
    allowSomeday() {
      return !this.onlyDates
    },
    allowBloqued() {
      return !this.onlyDates || this.allowNull
    },
    allowRepeat() {
      return this.repeat && !this.onlyDates
    },

    getTime() {
      if (this.time) {
        if (this.$store.state.userInfo.disablePmFormat)
          return this.time
        return mom(this.time, 'H:m').format('h:m A')
      }
    },

    currentMoment() {
      return mom(this.current, 'Y-M-D')
    },
    selectedMoment() {
      return mom(this.selected, 'Y-M-D')
    },


    firstWeekDayRange() {
      return parseInt(this.currentMoment.clone().startOf('month').format('d'), 10)
    },
    daysInMonth() {
      return this.currentMoment.daysInMonth()
    },
    selectedDay() {
      if (
        !this.currentMoment.isSame(this.selectedMoment, 'month') ||
        !this.currentMoment.isSame(this.selectedMoment, 'year')
      )
        return false
      return parseInt(this.selectedMoment.format('D'), 10)
    },

    currentYear() {
      return this.currentMoment.format('YYYY')
    },
    currentMonth() {
      return this.currentMoment.format('MMM')
    },
  },
  watch: {
    current() {
      setTimeout(() => this.$emit('calc'), 0)
    },
  }
}

</script>

<style scoped>

.CalendarPicker {
  width: 280px;
}

.fast-icons {
  margin: 8px 8px;
}

.calendar-wrapper {
  margin: 0 8px 8px 8px;
}

.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.current-date {
  font-size: 1.2em;
  color: var(--primary);
}

.arrow-left {
  margin-right: 8px;
  transform: rotate(90deg);
}

.arrow-right {
  margin-left: 8px;
  transform: rotate(-90deg);
}

.grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: 30px;
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

.num:hover, .active {
  background-color: var(--primary);
  user-select: none;
  color: var(--dark-void);
}

</style>
