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
      <Calendar class="calendar-wrapper"
        v-model="selected"

        @calc='$emit("calc")'
      />
      <div class="buttons">
        <ButtonInput
          :value='getTime ? getTime : "Add time"'
          icon='duration'
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
import Calendar from '@/components/Scheduling/Calendar.vue'

import { mapGetters, mapState } from 'vuex'

import mom from 'moment'

import utils from "@/utils"

const TOD = mom()
const TOD_STR = TOD.format('Y-M-D')

export default {
  components: {
    SearchInput, Calendar,
    ButtonInput,
  },
  props: ['repeat', 'onlyDates', 'defaultTime', 'initial', 'noTime', 'allowNull'],
  data() {
    return {
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
    selectDate(date) {
      this.selected = date
    },
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

    selectedMoment() {
      return mom(this.selected, 'Y-M-D')
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
      if (res)
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

.Calendar {
  margin: 0 8px 8px 8px;
}

.buttons {
  display: flex;
}

.buttons .Button {
  flex-basis: 100%;
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
