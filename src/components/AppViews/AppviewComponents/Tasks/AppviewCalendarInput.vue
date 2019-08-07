<template>
  <div class='calendar-selection dark card round-border'>
    <div class='el cancel-sortable-unselect dark' @click='selectToday'>
      <span class='el-icon'><i class='txt fas fa-star fa-lg' style='color: #FFE366'></i></span>
      <span class='el-name txt dark'>
        <span>Today</span>
        <span class='fade'>{{ weekDayFromToday() }}</span>
      </span>
    </div>
    <div class='el cancel-sortable-unselect dark' @click='selectTomorrow'>
      <span class='el-icon'><i class='txt fas fa-sun fa-lg' style='color: #FF7B66'></i></span>
      <span class='el-name txt dark'>
        <span>Tomorrow</span>
        <span class='fade'>{{ weekDayFromTomorrow() }}</span>
      </span>
    </div>
    <div class='el cancel-sortable-unselect dark' @click='selectNextweek'>
      <span class='el-icon'><i class='txt fas fa-calendar-week fa-lg' style='color: #88DDB7'></i></span>
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
      <span v-if='isDesktop'>
        <form-input class='add-time tiny'
          input-theme='dark'
          placeholder='Add time...'
          v-model='time'
          :disabled='true'
          :max='10'
        />
      </span>
      <span v-else class='add-time red'>Add time</span>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Watch } from 'vue-property-decorator'
import { Getter, namespace } from 'vuex-class'

const set = namespace('settings')

import FormInput from '@/components/PopUps/FormComponents/FormInput.vue'

import moment from 'moment'

import appUtils from '@/utils/app'

@Component({
  components: {
    'form-input': FormInput,
  },
})
export default class CalendarInput extends Vue {
  @Getter isDesktop!: boolean

  @set.State timeFormat!: '13:00' | '1:00pm'
  @set.State nextWeek!: string
  
  originalMoment: any = null
  selectedMoment: any = null
  time: string = ''

  created() {
    this.originalMoment = moment()
    this.selectedMoment = this.originalMoment.clone()
  }

  selectDay(num: number) {
    this.selectedMoment.date(num)
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
  emitEvent(moment?: any) {
    if (!moment)
      moment = this.selectedMoment
    const time = appUtils.getTaskInputTime(this.time.split(' '), this.timeFormat)
    const day = moment.format('D')
    const month = moment.format('M')
    const year = moment.format('Y')
    this.$emit('select', {
      time, day, month, year,
      parsed: appUtils.parseTaskInputObjectToString({
        time, day, month, year,
      }),
    })
  }
  nextMonth() {
    this.selectedMoment.add(1, 'M')
    this.$forceUpdate()
  }
  previousMonth() {
    this.selectedMoment.subtract(1, 'M')
    this.$forceUpdate()
  }

  goToOriginalDate() {
    this.selectedMoment = this.originalMoment.clone()
  }
  isSelectedDate(day: number): boolean {
    const clone = this.selectedMoment.clone().date(day)
    return clone.isSame(this.selectedMoment)
  }
  monthDays(): number[] {
    const arr = []
    const daysInMonth = this.selectedMoment.daysInMonth()
    for (let i = 1;i <= daysInMonth; i++)
      arr.push(i)
    return arr
  }
  firstWeekDayRange(): number[] {
    const clone = this.selectedMoment.clone()
    const num = parseInt(clone.startOf('month').format('d'), 10)
    const arr = []
    for (let i = 1;i <= num;i++)
      arr.push(i)
    return arr
  }
  monthName(): string {
    return this.selectedMoment.format('MMM')
  }
  weekDayFromTomorrow(): string {
    const mom = this.originalMoment.clone()
    return mom.add(1, 'd').format('ddd')
  }
  weekDayFromToday(): string {
    return this.originalMoment.format('ddd')
  }
  year() {
    return this.selectedMoment.format('Y')
  }
  month() {
    return this.selectedMoment.format('M')
  }
  day() {
    return this.selectedMoment.format('D')
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
  margin-top: 4px;
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
