<template>
  <div class='calendar-selection dark card round-border'>
    <div class='el cancel-sortable-unselect dark'>
      <span class='el-icon'><i class='txt fas fa-star fa-lg' style='color: #FFE366'></i></span>
      <span class='el-name txt dark'>
        <span>Today</span>
        <span class='fade'>{{ weekDayFromToday }}</span>
      </span>
    </div>
    <div class='el cancel-sortable-unselect dark'>
      <span class='el-icon'><i class='txt fas fa-sun fa-lg' style='color: #FF7B66'></i></span>
      <span class='el-name txt dark'>
        <span>Tomorrow</span>
        <span class='fade'>{{ weekDayFromTomorrow }}</span>
      </span>
    </div>
    <div class='el cancel-sortable-unselect dark'>
      <span class='el-icon'><i class='txt fas fa-calendar-week fa-lg' style='color: #88DDB7'></i></span>
      <span class='el-name txt dark'>Next week</span>
    </div>
    <div class='drop'>
      <div class='calendar-header'>
        <div class='header-row'>
          <span class='txt dark'>
            {{ monthName }} {{ year }}
          </span>
          <span class='select'>
            <i class='fas fa-angle-left fa-sm icon icon-calendar dark'></i>
            <i class='fas fa-circle fa-sm icon icon-calendar dark'></i>
            <i class='fas fa-angle-right fa-sm icon icon-calendar dark'></i>
          </span>
        </div>
        <div class='header-row weeks'>
          <span class='txt dark week'>S</span>
          <span class='txt dark week'>M</span>
          <span class='txt dark week'>T</span>
          <span class='txt dark week'>W</span>
          <span class='txt dark week'>T</span>
          <span class='txt dark week'>F</span>
          <span class='txt dark week'>S</span>
        </div>
      </div>
      <div class='dates'>
        <span v-for='i in firstWeekDayRange' :key='i + 100'></span>
        <span v-for='i in monthDays'
          class='txt dark date'
          :key='i'
          :class='{active: i === day}'
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

import { Component, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

import FormInput from '@/components/PopUps/FormComponents/FormInput.vue'

import moment from 'moment'

@Component({
  components: {
    'form-input': FormInput,
  },
})
export default class CalendarInput extends Vue {
  @Getter isDesktop!: boolean
  
  moment: any = null
  day: number = 1
  month: number = 1
  year: number = 2019
  time: string = ''

  created() {
    this.moment = moment()

    this.month = parseInt(this.moment.format('M'), 10)
    this.year = parseInt(this.moment.format('Y'), 10)
    this.day = parseInt(this.moment.format('D'), 10)
  }

  selectDay(num: number) {
    this.day = num
    this.updateMoment()
  }
  selectMonth(num: number) {
    this.month = num
    this.updateMoment()
  }
  selectYear(num: number) {
    this.year = num
    this.updateMoment()
  }
  updateMoment() {
    this.moment = moment(`${this.day}-${this.month}-${this.year}`, 'D-M-Y', true)
  }

  get firstWeekDayRange(): number[] {
    const num = parseInt(moment().startOf('month').format('d'), 10)
    const arr = []
    for (let i = 1;i <= num;i++)
      arr.push(i)
    return arr
  }
  get monthDays(): number[] {
    const arr = []
    const daysInMonth = this.moment.daysInMonth()
    for (let i = 1;i <= daysInMonth; i++)
      arr.push(i)
    return arr
  }
  get monthName(): string {
    return moment().month(this.month - 1).format('MMM')
  }
  get weekDayFromTomorrow(): string {
    return moment().day(this.day + 1).format('ddd')
  }
  get weekDayFromToday(): string {
    return moment().day(this.day).format('ddd')
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

.weeks {
  font-size: .8em;
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
  grid-template-columns: auto auto auto auto auto auto auto;
  justify-content: space-between;
}

.add-time {
  margin-top: 4px;
  color: #FF6B66;
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
  background-color: #FF6B66;
}

.header-row + .header-row {
  margin: 8px 0;
}

.icon-calendar + .icon-calendar {
  margin-left: 14px;
}

.fa-circle {
  transform: translateY(-2px);
  font-size: .6em;
}

</style>

<style scoped src='@/assets/css/drop.css'></style>
