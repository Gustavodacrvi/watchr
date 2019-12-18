<template>
  <div class="RepeatPicker" :class="platform">
    <span>{{ l["Repeat:"] }}   </span>
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
       on the
      <AuthOptions
        :options='data.monthDayOptions'
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
      Yearl
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
    <div class="extra-options margin">
      <div class="cont">
        Deadline:
      </div>
      <div class="cont">
        <span class="option rb cursor" @click="getDeadlineDate">
          {{ deadlineStr }}
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
    <AuthButton class="margin"
      value='Repeat task'
      @click="update"
    />
  </div>
</template>

<script>

import AuthOptions from "@/components/Auth/Options.vue"
import AuthSimpleInput from "@/components/Auth/SimpleInput.vue"
import AuthButton from "@/components/Auth/Button.vue"

import { mapGetters } from 'vuex'

import mom from 'moment/src/moment'

const TOD_STR = mom().format('Y-M-D')

export default {
  props: ['content'],
  components: {
    AuthOptions, AuthSimpleInput,
    AuthButton,
  },
  data() {
    return {
      data: {
        days: '1',
        activeRepeatOption: 'After completion',
        repeatOptions: [
          'After completion',
          'Daily',
          'Weekly',
          'Monthly',
          'Yearly',
        ],
        begins: TOD_STR,
        deadline: null,

        ends: 'Never',
        endOptions: [
          'Never',
          'After',
          'On date'
        ],
        monthDay: '1st',
        monthDayOptions: [
          '1st', '2nd', '3rd', '4th', '5th',
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
        weeks: ['Mon'],
        endTimes: '1',
        endDate: TOD_STR,
      }
    }
  },
  created() {
    if (this.content && this.content.data)
      this.data = this.content.data
  },
  methods: {
    toggle(d) {
      if (this.isActive(d)) {
        const i = this.data.weeks.findIndex(e => e === d)
        this.data.weeks.splice(i, 1)
      }
      else this.data.weeks.push(d)
    },
    isActive(d) {
      return this.data.weeks.includes(d)
    },
    update() {

    },
    getDate(callback) {
      this.$emit('update', {
        comp: 'CalendarPicker',
        content: {
          onlyDates: true,
          payload: this.$data,
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
    getDeadlineDate() {
      this.getDate(date => ({
        deadline: date,
      }))
    },
    getEndDate() {
      this.getDate(date => ({
        endDate: date,
      }))
    },
  },
  computed: {
    ...mapGetters(['platform', 'l']),
    deadlineStr() {
      if (!this.data.deadline)
        return 'No deadline'
      return this.data.deadline
    },
    getDays() {
      return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    },
  },
  watch: {
    'data.activeRepeatOption'() {
      this.$emit('calc')
    },
  }
}

</script>

<style scoped>

.RepeatPicker.desktop {
  flex-basis: 450px;
  width: 450px;
  margin: 12px;
  padding: 0 12px;
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
  border: 1px solid var(--dark);
  transition-duration: .2s;
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
  border-radius: 50px;
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
