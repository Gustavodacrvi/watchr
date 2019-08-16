<template>
  <div class='calendar-selection dark card round-border'>
    <div class='el cancel-sortable-unselect dark' @click='moveToSettingsNav'>
      <span class='el-name txt dark'>
        <span>{{ getTimeZone }}</span>
      </span>
    </div>
    <div class='el cancel-sortable-unselect dark' @click='selectToday'>
      <span class='el-icon'><i class='txt fas fa-star fa-lg' style='color: #FFE366'></i></span>
      <span class='el-name txt dark'>
        <span>Today</span>
        <span class='fade'>{{ weekDayFromToday() }}</span>
      </span>
    </div>
    <div class='el cancel-sortable-unselect dark' @click='selectTomorrow'>
      <span class='el-icon'><i class='txt fas fa-sun fa-lg' style='color: #ffa166'></i></span>
      <span class='el-name txt dark'>
        <span>Tomorrow</span>
        <span class='fade'>{{ weekDayFromTomorrow() }}</span>
      </span>
    </div>
    <div class='el cancel-sortable-unselect dark' @click='selectNextweek'>
      <span class='el-icon'><i class='txt fas fa-calendar-week fa-lg' style='color: #9CE283'></i></span>
      <span class='el-name txt dark'>Next week</span>
    </div>
    <div class='drop'>
      <div class='calendar-header'>
        <div class='header-row'>
          <span class='txt dark'>
            {{ monthName() }} {{ year() }}
          </span>
          <span class='select'>
            <i class='fas fa-angle-left fa-sm icon icon-calendar pointer dark' @click='previousMonth'></i>
            <i class='fas fa-circle fa-sm icon icon-calendar pointer dark' @click='goToOriginalDate'></i>
            <i class='fas fa-angle-right fa-sm icon icon-calendar pointer dark' @click='nextMonth'></i>
          </span>
        </div>
        <div class='header-row weeks'>
          <span class='txt dark week fade'>S</span>
          <span class='txt dark week fade'>M</span>
          <span class='txt dark week fade'>T</span>
          <span class='txt dark week fade'>W</span>
          <span class='txt dark week fade'>T</span>
          <span class='txt dark week fade'>F</span>
          <span class='txt dark week fade'>S</span>
        </div>
      </div>
      <div class='dates'>
        <span v-for='i in firstWeekDayRange()' :key='i + 100'></span>
        <span v-for='i in monthDays()'
          class='txt dark date'
          :key='i'
          :class='{active: isSelectedDate(i)}'
          @click='selectDay(i)'
        >
          <span class='number'>{{ i }}</span>
        </span>
      </div>
      <span>
        <form-input class='add-time tiny'
          input-theme='dark'
          placeholder='Add time...'
          v-model='time'
          :disabled='true'
          :max='10'
        />
      </span>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Watch } from 'vue-property-decorator'
import { Getter, Mutation, namespace } from 'vuex-class'

const set = namespace('settings')

import FormInput from '@/components/PopUps/FormComponents/FormInput.vue'

import moment from 'moment-timezone'

import appUtils from '@/utils/app'
import { IndexMutations, IndexGetters } from '../../../../interfaces/store/index'
import { SetState } from '../../../../interfaces/store/settings';

@Component({
  components: {
    'form-input': FormInput,
  },
})
export default class CalendarInput extends Vue {
  @Mutation pushPopUp!: IndexMutations.PushPopUp
  @Getter isDesktop!: IndexGetters.IsDesktop

  @set.State timeFormat!: SetState.timeFormat
  @set.State nextWeek!: SetState.nextWeek
  @set.State timeZone!: SetState.timeZone

  originalMoment: any = null
  selectedMoment: any = null
  visualMoment: any = null
  time: string = ''

  created() {
    moment.tz.setDefault(this.timeZone)
    this.originalMoment = moment()
    this.selectedMoment = this.originalMoment.clone()
    this.visualMoment = this.originalMoment.clone()
  }

  selectDay(num: number) {
    this.selectedMoment = this.visualMoment.clone().date(num)
    this.$forceUpdate()
    this.emitEvent()
  }
  selectToday() {
    this.emitEvent(this.originalMoment)
  }
  selectTomorrow() {
    const clone = this.originalMoment.clone()
    this.emitEvent(clone.add(1, 'd'))
  }
  selectNextweek() {
    this.emitEvent(appUtils.getNextWeek(this.originalMoment.clone(), this.nextWeek))
  }
  emitEvent(mom?: any) {
    if (!mom)
      mom = this.selectedMoment
    const time = appUtils.getTaskInputTime(this.time.split(' '), this.timeFormat)
    const day = mom.format('D')
    const month = mom.format('M')
    const year = mom.format('Y')
    const obj = {
      time, day, month, year,
    }
    const utc = appUtils.getUtcValuesFromTaskInputObj(obj, this.timeZone)
    this.$emit('select', {
      ...obj, utc,
      parsed: appUtils.parseTaskInputObjectToString({
        ...obj,
      }, this.timeFormat, this.timeZone),
    })
  }
  nextMonth() {
    this.visualMoment.add(1, 'M')
    this.$forceUpdate()
  }
  previousMonth() {
    this.visualMoment.subtract(1, 'M')
    this.$forceUpdate()
  }

  goToOriginalDate() {
    this.selectedMoment = this.originalMoment.clone()
    this.visualMoment = this.originalMoment.clone()
  }
  isSelectedDate(day: number): boolean {
    const clone = this.visualMoment.clone().date(day)
    return clone.isSame(this.selectedMoment)
  }
  monthDays(): number[] {
    const arr = []
    const daysInMonth = this.visualMoment.daysInMonth()
    for (let i = 1; i <= daysInMonth; i++)
      arr.push(i)
    return arr
  }
  firstWeekDayRange(): number[] {
    const clone = this.visualMoment.clone()
    const num = parseInt(clone.startOf('month').format('d'), 10)
    const arr = []
    for (let i = 1; i <= num; i++)
      arr.push(i)
    return arr
  }
  monthName(): string {
    return this.visualMoment.format('MMM')
  }
  weekDayFromTomorrow(): string {
    const mom = this.visualMoment.clone()
    return mom.add(1, 'd').format('ddd')
  }
  weekDayFromToday(): string {
    return this.visualMoment.format('ddd')
  }
  year() {
    return this.visualMoment.format('Y')
  }
  month() {
    return this.visualMoment.format('M')
  }
  day() {
    return this.visualMoment.format('D')
  }
  moveToSettingsNav() {
    this.pushPopUp('')
    this.$router.push('/settings/general#DateandTime')
  }

  get getTimeZone(): string {
    return appUtils.parseMomentTimeZone(this.timeZone)
  }

  @Watch('time')
  onChange() {
    this.emitEvent()
  }
}

</script>

<style scoped>

.el {
  padding-left: 8px;
}

.calendar-selection {
  width: 275px;
  overflow: hidden;
}

.drop {
  margin: 12px;
}

.el-name {
  display: flex;
  justify-content: space-between;
  padding-right: 10px;
}

.fade {
  opacity: .5;
}

.week {
  width: 20px;
  text-align: center;
}

.dates {
  display: grid;
  grid-template-columns: auto auto auto auto auto auto auto;
  justify-content: space-between;
}

.header-row {
  display: flex;
  justify-content: space-between;
}

.weeks {
  display: grid;
  font-size: .8em;
  margin-top: 18px !important;
  grid-template-columns: auto auto auto auto auto auto auto;
  justify-content: space-between;
}

.add-time {
  margin-top: 6px;
  color: #83B7E2;
}

.date {
  display: inline-block;
  position: relative;
  width: 25px;
  height: 25px;
  text-align: center;
  border-radius: 100px;
  transition: color .3s, background-color .3s;
  cursor: pointer;
}

.number {
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%,-50%);
}

.date:hover, .active {
  color: white;
  background-color: #83B7E2;
}

.header-row + .header-row {
  margin: 8px 0;
}

.icon-calendar + .icon-calendar {
  margin-left: 18px;
}

.fa-circle {
  transform: translateY(-2px);
  font-size: .6em;
}

</style>

<style scoped src='@/assets/css/drop.css'></style>
