<template>
  <div class="RepeatPicker" :class="layout">
    <div class="content">
      <span>Repeat:   </span>
      <AuthOptions class='special-options' style="z-index: 3"
        :options='data.repeatOptions'
        :active='data.activeRepeatOption'
        minWidth='200px'
        @select='v => data.activeRepeatOption = v'
      />
      <div class="margin"></div>
      <div class="special-options" v-if="data.activeRepeatOption === 'After completion'">
        Repeat
        <AuthSimpleInput
          v-model="data.days"
          width='15px'
        />
        days after task completion.
      </div>
      <div class="special-options" v-else-if="data.activeRepeatOption === 'Daily'">
        Every
        <AuthSimpleInput
          v-model="data.days"
          width='15px'
        />
        days.
      </div>
      <div class="special-options" v-else-if="data.activeRepeatOption === 'Weekly'">
        Every
        <AuthSimpleInput
          v-model="data.days"
          width='15px'
        />
        weeks.
        <div class="days margin">
          <span v-for="d of getDays" :key="d"
            class="option cursor week"
            :class="{active: isActive(d)}"
            @click="toggle(d)"
          >{{ d }}</span>
        </div>
      </div>
      <div class="special-options" v-else-if="data.activeRepeatOption === 'Monthly'">
        Every
        <AuthSimpleInput
          v-model="data.days"
          width='15px'
        />
        months on the
        <AuthOptions
          :options='computedMonthDayOptions'
          :active='data.monthDay'
          minWidth='200px'
          @select='v => data.monthDay = v'
        />&nbsp;
        <AuthOptions
          :options='data.weekDayOptions'
          :active='data.weekDay'
          minWidth='200px'
          @select='v => data.weekDay = v'
        />
      </div>
      <div class="special-options" v-else-if="data.activeRepeatOption === 'Yearly'">
        Every
        <AuthSimpleInput
          v-model="data.days"
          width='15px'
        />
        years on the 
        <AuthOptions
          :options='computedMonthDayOptions'
          :active='data.monthDay'
          minWidth='200px'
          @select='v => data.monthDay = v'
        />&nbsp;
        <AuthOptions
          :options='data.weekDayOptions'
          :active='data.weekDay'
          minWidth='200px'
          @select='v => data.weekDay = v'
        />&nbsp;
        <div class="days margin">
          <span v-for="d of data.yearMonthOptions" :key="d"
            class="option cursor week"
            :class="{active: isMonthActive(d)}"
            @click="toggleMonth(d)"
          >{{ d }}</span>
        </div>
      </div>
      <div class="hr"></div>
      <div class="extra-options margin">
        <div class="cont">
          Begins:
        </div>
        <div class="cont">
          <span class="option rb cursor" @click="getBeginDate">
            {{ data.begins }}
          </span>
        </div>
      </div>
      {{data.time}}
      <div class="extra-options margin">
        <div class="cont">
          Time:
        </div>
        <div class="cont">
          <span class="option rb cursor" @click="getTimeInput">
            {{ getTime }}
          </span>
        </div>
      </div>
      <div class="extra-options margin">
        <div class="cont">
          Ends:
        </div>
        <div class="cont">
          <AuthOptions
            :options='data.endOptions'
            :active='data.ends'
            minWidth='200px'
            @select='v => data.ends = v'
          />
          <template v-if="data.ends === 'After'">
            <span>&nbsp;</span>
            <AuthSimpleInput
              v-model="data.endTimes"
              width='15px'
            />
            <span>&nbsp;times</span>
          </template>
          <template  class="special-options" v-else-if="data.ends === 'On date'">
            <span>&nbsp;</span>
            <div class="option rb cursor"  @click="getEndDate">
              {{ data.endDate }}
            </div>
          </template>
        </div>
      </div>
    </div>
    <ButtonInput class="margin border-radius"
      value='Repeat task'
      icon='repeat'
      @click.native="emit"
    />
  </div>
</template>

<script>

import AuthOptions from "@/components/Auth/Options.vue"
import AuthSimpleInput from "@/components/Auth/SimpleInput.vue"
import ButtonInput from "../../Components/Button.vue"

import { mapGetters, mapState } from 'vuex'

import mom from 'moment'

const TOD_STR = mom().format('Y-M-D')

export default {
  props: ['content'],
  components: {
    AuthOptions, AuthSimpleInput,
    ButtonInput,
  },
  data() {
    return {
      data: {
        days: '1',
        activeRepeatOption: 'After completion',
        repeatOptions: !this.content.disableDaily ? [
          'After completion',
          'Daily',
          'Weekly',
          'Monthly',
          'Yearly',
        ] : [
          'After completion',
          'Weekly',
          'Monthly',
          'Yearly',
        ],
        begins: TOD_STR,

        ends: 'Never',
        endTimes: '1',
        endDate: TOD_STR,
        endOptions: [
          'Never',
          'After',
          'On date'
        ],
        monthDay: '1st',
        monthDayOptions: [
          'last', '1st', '2nd', '3rd', '4th', '5th',
          '6th', '7th', '8th', '9th', '10th',
          '11th', '12th', '13th', '14th', '15th',
          '16th', '17th', '18th', '19th', '20th',
          '21st', '22nd', '23rd', '24th', '25th',
          '26th', '27th', '28th', '29th', '30th',
          '31st'
        ],
        weekDay: 'day',
        weekDayOptions: [
          'day',
          'Sunday',
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ],
        yearMonthOptions: [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ],
        months: ['Jan'],
        weeks: ['Mon'],
        time: null,
      }
    }
  },
  created() {
    if (this.content && this.content.data)
      this.data = this.content.data
  },
  methods: {
    update() {
      const days = parseInt(this.data.days, 10)
      const editDate = TOD_STR
      const obj = {
        begins: this.data.begins,
        time: this.data.time,
      }
      if (this.data.ends !== 'Never') {
        if (this.data.ends === 'On date') {
          obj.ends = {
            type: 'on date',
            onDate: this.data.endDate,
          }
        } else {
          obj.ends = {
            type: 'times',
            times: this.data.endTimes,
          }
        }
      }

      let monthDay = undefined
      if (this.data.monthDay === 'last') {
        monthDay = 'last'
      } else monthDay = parseInt(this.data.monthDay, 10)

      let weekDay = undefined
      if (this.data.weekDay === 'day') {
        weekDay = 'day'
      } else weekDay = parseInt(mom(this.data.weekDay, 'dddd').format('e'), 10)
      
      switch (this.data.activeRepeatOption) {
        case 'After completion': {
          return {
            ...obj,
            editDate,
            type: 'after completion',
            afterCompletion: days,
          }
        }
        case 'Daily': {
          return {
            ...obj,
            editDate,
            type: 'daily',
            daily: days,
          }
        }
        case 'Weekly': {
          return {
            ...obj,
            editDate,
            type: 'weekly',
            weekly: {
              every: days,
              days: this.data.weeks.map(w => parseInt(mom(w, 'ddd').format('e'), 10)),
            },
          }
        }
        case 'Monthly': {
          return {
            ...obj,
            editDate,
            type: 'monthly',
            monthly: {
              every: days,
              place: monthDay,
              type: weekDay,
            }
          }
        }
        case 'Yearly': {
          return {
            ...obj,
            editDate,
            type: 'yearly',
            yearly: {
              every: days,
              place: monthDay,
              type: weekDay,
              months: this.data.months.map(w => parseInt(mom(w, 'MMM').format('M'), 10))
            }
          }
        }
      }
    },
    emit() {
      const obj = this.content.callback(this.update())
      if (!obj) {
        this.$emit('close')
      } else this.$emit('update', obj)
    },
    toggle(d) {
      if (this.isActive(d)) {
        const i = this.data.weeks.findIndex(e => e === d)
        this.data.weeks.splice(i, 1)
      }
      else this.data.weeks.push(d)
    },
    toggleMonth(d) {
      if (this.isMonthActive(d)) {
        const i = this.data.months.findIndex(e => e === d)
        this.data.months.splice(i, 1)
      }
      else this.data.months.push(d)
    },
    isMonthActive(d) {
      return this.data.months.includes(d)
    },
    isActive(d) {
      return this.data.weeks.includes(d)
    },
    getDate(callback) {
      this.$emit('update', {
        comp: 'CalendarPicker',
        content: {
          onlyDates: true,
          callback: date => {
            return {
              comp: 'RepeatPicker',
              cardOptions: {
                overflow: true,
              },
              content: {
                data: {
                  ...this.data,
                  ...callback(date.specific),
                },
                callback: this.content.callback,
              }
            }
          }
        }
      })
    },
    getTimeInput() {
      this.$emit('update', {
        comp: 'TimePicker',
        content: {
          callback: time => {
            return {
              comp: 'RepeatPicker',
              cardOptions: {
                overflow: true,
              },
              content: {
                data: {
                  ...this.data,
                  time,
                },
                callback: this.content.callback,
              }
            }
          }
        }
      })
    },
    getBeginDate() {
      this.getDate(date => ({
        begins: date,
      }))
    },
    getEndDate() {
      this.getDate(date => ({
        endDate: date,
      }))
    },
  },
  computed: {
    ...mapState({
      userInfo: state => state.userInfo,
    }),
    ...mapGetters(['layout']),
    getDays() {
      return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    },
    computedMonthDayOptions() {
      if (this.data.weekDay === 'day')
        return this.data.monthDayOptions
      return this.data.monthDayOptions.slice(0, 4)
    },
    getTime() {
      if (this.data.time) {
        if (this.userInfo.disablePmFormat)
          return this.data.time
        return mom(this.data.time, 'H:m').format('h:m A')
      }
      return 'No time'
    },
  },
  watch: {
    'data.activeRepeatOption'() {
      setTimeout(() => {
        this.$emit('calc')
      })
    },
  }
}

</script>

<style scoped>

.RepeatPicker.desktop {
  flex-basis: 270px;
  width: 270px;
}

.content {
  margin: 12px;
}

.RepeatPicker.mobile {
  width: 275px;
  margin: 12px;
}

.margin, .hr {
  margin-top: 12px;
}

.hr {
  border: 1px solid var(--dark);
}

.extra-options {
  display: flex;
  position: relative;
  z-index: 1;
}

.cont {
  flex-basis: 50%;
  display: flex;
  align-items: center;
}

.option {
  display: inline-block;
  padding: 6px;
  background-color: var(--sidebar-color);
  transition-duration: .15s;
  background-color: none;
}

.special-options {
  position: relative;
  z-index: 2;
}

.option:hover {
  background-color: var(--light-gray);
}

.week {
  border-radius: 5000px;
  margin-right: 8px;
}


.week:active {
  transform: scale(.9, .9);
}

.active {
  background-color: var(--primary) !important;
  color: white;
  border: none;
}

</style>
