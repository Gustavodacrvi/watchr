<template>
  <div class="CalendarPicker">
    <SearchInput
      v-model="smart"
      placeholder='Smart input...'
      ref='input'
      :focus='true'
      @keydown.native='keydownInput'
    />
    <div v-if="!calendar">
      <div class="fast-icons">
        <Icon
          class="cursor icon-box"
          width="20px"
          icon="star"
          color='var(--yellow)'
          ref='tod'
          title='Today'
          :active='selectionPos === 1 && isDesktopBreakPoint'
          :box='true'
          @click="today"
        />
        <Icon
          class="cursor icon-box"
          width="20px"
          icon="sun"
          color='var(--orange)'
          ref='tom'
          title='Tomorrow'
          :box='true'
          :active='selectionPos === 2 && isDesktopBreakPoint'
          @click="tomorrow"
        />
        <Icon v-if="allowSomeday"
          class="cursor icon-box"
          width="20px"
          ref='any'
          color='var(--olive)'
          icon="layer-group"
          title='Anytime'
          :active='selectionPos === 3 && isDesktopBreakPoint'
          :box='true'
          @click="someday"
        />
        <Icon v-if="allowSomeday"
          class="cursor icon-box"
          width="20px"
          ref='som'
          icon="archive"
          color='var(--brown)'
          title='Someday'
          :box='true'
          :active='selectionPos === 4 && isDesktopBreakPoint'
          @click="anytime"
        />
        <Icon v-if="allowBloqued"
          class="cursor icon-box"
          ref='bloq'
          width="20px"
          icon="bloqued"
          color='var(--red)'
          :active='selectionPos === 5 && isDesktopBreakPoint'
          title='No date'
          :box='true'
          @click="noDate"
        />
        <Icon v-if="allowRepeat"
          class="cursor icon-box"
          ref='rep'
          width="20px"
          icon="repeat"
          title='Recurring dates'
          :active='selectionPos === 6 && isDesktopBreakPoint'
          :box='true'
          @click="$emit('repeat')"
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
      <div class="buttons">
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
    </div>
    <div v-else class="calendar-str-wrapper">
      <Icon
        icon='calendar'
        color='var(--green)'
        width='20px'
      />
      <span class="calendar-str">
        {{ calendarStr }}
      </span>
    </div>
  </div>
</template>

<script>

import SearchInput from '../Components/SearchInput.vue'
import ButtonInput from '../Components/Button.vue'

import { mapGetters, mapState } from 'vuex'

import mom from 'moment'

import utils from "@/utils"

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

      calendar: null,
      smart: '',
      
      time: this.defaultTime || null,
      selectionPos: 0,
    }
  },
  mounted() {
    window.addEventListener('keydown', this.keydown)

    if (this.isDesktopBreakPoint)
      this.focusName()
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.keydown)
  },
  methods: {
    today() {
      this.saveDate(TOD_STR)
    },
    tomorrow() {
      this.saveDate(mom(TOD_STR, 'Y-M-D').add(1, 'd').format('Y-M-D'))
    },
    someday() {
      this.$emit('select', {
        time: this.item || null,
        type: 'someday',
        editDate: TOD.format('Y-M-D'),
        begins: TOD.format('Y-M-D'),
      })
    },
    anytime() {
      this.$emit('select', {
        time: this.item || null,
        type: 'anytime',
        editDate: TOD.format('Y-M-D'),
        begins: TOD.format('Y-M-D'),
      })
    },
    noDate() {
      this.$emit('select', null)
    },
    
    keydownInput({key}) {
      if (key === "Enter")
        this.saveDate()
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
    addTime() {
      this.$emit("get-time", this.selected)
    },
    saveDate(specific = null) {
      this.$emit('select', this.calendar || {
        time: this.item || null,
        type: 'specific',
        editDate: TOD.format('Y-M-D'),
        specific: specific || this.selectedMoment.format('Y-M-D'),
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
    focusName() {
      this.$refs.input.focusInput()
    },
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
      return utils.parseCalendarObjectToString(this.calendar, this.userInfo, true)
    },

    iconKeyboardActions() {
      const c = ref => () => this.$refs[ref].click()

      const obj = {
        0: () => this.focusName(),
        1: c('tod'),
        2: c('tom'),
      }

      const getLength = () => Object.keys(obj).length

      if (this.allowSomeday) {
        obj[getLength()] = c('som')
        obj[getLength()] = c('any')
      }
      
      if (this.allowBloqued)
        obj[getLength()] = c('bloq')

      if (this.allowRepeat)
        obj[getLength()] = c('rep')

      return obj
    },
    keyboardActions() {
      return this.iconKeyboardActions
    },

    getTime() {
      if (this.time) {
        if (this.userInfo.disablePmFormat)
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
    selectionPos() {
      if (this.selectionPos === 0)
        this.focusName()
      else
        this.$refs.input.blur()
    },
    current() {
      setTimeout(() => this.$emit('calc'), 0)
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
  }
}

</script>

<style scoped>

.CalendarPicker {
  width: 280px;
  overflow: hidden;
  border-radius: 8px;
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
  grid-auto-rows: 25px;
}

.week-day, .day {
  display: flex;
  justify-content: center;
  align-items: center;
}

.buttons {
  display: flex;
}

.buttons .Button {
  flex-basis: 100%;
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

.calendar-str-wrapper {
  height: 50px;
  display: flex;
  align-items: center;
  padding-left: 18px;
}

.calendar-str {
  font-size: 1.1em;
  margin-left: 8px;
}

.fast-icons {
  position: relative;
  z-index: 2;
}

</style>
