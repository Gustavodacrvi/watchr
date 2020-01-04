<template>
  <div class="RecentData popup scroll-thin cb shadow rb" :class="platform">
    <div class="tac title">
      <h3 class="pc">{{ l['Recent Data'] }}</h3>
    </div>
    <div class="cont">
      <div class="numbers">
        <div class="display-row">
          <div class="cell">
            <span class="num">
              {{dailyPomos}}
            </span>
            <span class="label">
              Daily Pomos
            </span>
          </div>
          <div class="cell">
            <span class="num">
              {{weeklyPomos}}
            </span>
            <span class="label">
              Weekly Pomos
            </span>
          </div>
          <div class="cell">
            <span class="num">
              {{totalPomos}}
            </span>
            <span class="label">
              Total Pomos
            </span>
          </div>
        </div>
        <div class="display-row blue">
          <div class="cell">
            <span class="num">
              {{dailyFocus}}
            </span>
            <span class="label">
              Daily Focus(h)
            </span>
          </div>
          <div class="cell">
            <span class="num">
              {{weeklyFocus}}
            </span>
            <span class="label">
              Weekly Focus(h)
            </span>
          </div>
          <div class="cell">
            <span class="num">
              {{totalFocus}}
            </span>
            <span class="label">
              Total Focus(h)
            </span>
          </div>
        </div>
        <div class="display-row green">
          <div class="cell">
            <span class="num">
              {{dailyRest}}
            </span>
            <span class="label">
              Daily Rest(h)
            </span>
          </div>
          <div class="cell">
            <span class="num">
              {{weeklyRest}}
            </span>
            <span class="label">
              Weekly Rest(h)
            </span>
          </div>
          <div class="cell">
            <span class="num">
              {{totalRest}}
            </span>
            <span class="label">
              Total Rest(h)
            </span>
          </div>
        </div>
      </div>

      <div class="graph">
        <div class="float">
          <div>
            <h4>Focus time(min)</h4>
          </div>
          <div>
            <span class="opt cursor remove-highlight" :class="{active: focusTime === 'Day'}" @click="focusTime = 'Day'">
              Day
            </span>
            <span class="opt cursor remove-highlight" :class="{active: focusTime === 'Week'}" @click="focusTime = 'Week'">
              Week
            </span>
            <span class="opt cursor remove-highlight" :class="{active: focusTime === 'Month'}" @click="focusTime = 'Month'">
              Month
            </span>
          </div>
        </div>
        <TimeGraph
          :data='focusTimeData'
        />
      </div>

      <StatsGraph class="graph"
        title='Recent Pomos'
        :stats='stats'
        :getDataFunction='getCompletedPomosFromDate'
        :dataReducer='completedReducer'
      />
      <StatsGraph class="graph"
        title='Recent Rest'
        :stats='stats'
        :getDataFunction='getCompletedRestFromDate'
        :dataReducer='completedReducer'
      />
      <StatsGraph class="graph"
        title='Recent focus time(h)'
        :stats='stats'
        :getDataFunction='getFocusTimeFromDate'
        :dataReducer='timeReducer'
      />
      <StatsGraph class="graph"
        title='Recent rest time(h)'
        :stats='stats'
        :getDataFunction='getRestTimeFromDate'
        :dataReducer='timeReducer'
      />
    </div>
  </div>
</template>

<script>

import { mapGetters, mapState } from 'vuex'

import mom from 'moment'

import utils from '@/utils'

import StatsGraph from './StatsGraph.vue'
import TimeGraph from '@/components/Chartjs/Time.vue'

const TOD_STR = mom().format('Y-M-D')

const getValueFromTime = time => {
  const split = time.split(':')
  
  const hour = parseInt(split[0], 10)
  const min = parseInt(split[1], 10)
  let sec = 0
  if (split[2])
    sec = parseInt(split[2], 10)

  return sec + ((min * 60) + (hour * 3600))
}

const trunc = (x, n) => {
  const v = (typeof x === 'string' ? x : x.toString()).split('.')
  if (n <= 0) return v[0]
  let f = v[1] || ''
  if (f.length > n) return `${v[0]}.${f.substr(0,n)}`
  while (f.length < n) f += '0'
  return `${v[0]}.${f}`
}

export default {
  components: {
    TimeGraph,
    StatsGraph,
  },
  data() {
    return {
      focusTime: 'Day',
    }
  },
  methods: {
    getCompletedPomosFromDate(date) {
      const data = this.stats.dates[date]
      return (data && data.completedPomos) || 0
    },
    getCompletedRestFromDate(date) {
      const data = this.stats.dates[date]
      return (data && data.completedRest) || 0
    },
    getFocusTimeFromDate(date) {
      const data = this.stats.dates[date]
      return trunc(((data && data.focus) || 0) / 3600, 2)
    },
    getRestTimeFromDate(date) {
      const data = this.stats.dates[date]
      return trunc(((data && data.rest) || 0) / 3600, 2)
    },
    completedReducer(tot, num) {
      return tot + num
    },
    timeReducer(tot, num) {
      return tot + parseFloat(num, 10)
    },
    getFocusTimeDataByDate(date) {
      if (this.firstTime || !this.stats.dates[date] || !this.stats.dates[date].pomoEntries) return []
      const entries = this.stats.dates[date].pomoEntries
      const moments = entries.map(dt => mom(`${date} ${dt}`, 'Y-M-D HH:mm:ss'))
      const start = mom(date, 'Y-M-D').startOf('day')
      const end = start.clone().add(1, 'h')
      const arr = []

      let expectingEnd = false
      for (let i = 0;i < 24;i++) {
        let time = 0
        const insideMoms = moments.filter(m => 
          m.isSameOrAfter(start, 'second') && m.isBefore(end, 'second')
        )
        const even = insideMoms.length % 2 === 0
        
        if (expectingEnd && insideMoms.length === 0) {
          time += 3600
        } else if (expectingEnd) {
          expectingEnd = false
          time += insideMoms[0].diff(start, 'seconds')
          insideMoms.shift()
          if (insideMoms.length > 0) {
            if (!even) {
              for (let j = 0;j < insideMoms.length;j++)
                if (j % 2 !== 0)
                  time += insideMoms[j].diff(insideMoms[j - 1], 'seconds')
            } else {
              expectingEnd = true
              for (let j = 0;j < insideMoms.length;j++) {
                if ((j + 1) === insideMoms.length) {
                  time += end.diff(insideMoms[j], 'seconds')
                  break
                }
                if (j % 2 !== 0)
                  time += insideMoms[j].diff(insideMoms[j - 1], 'seconds')
              }
            }
          }
        } else if (even) {
          for (let j = 0;j < insideMoms.length;j++)
            if (j % 2 !== 0)
              time += insideMoms[j].diff(insideMoms[j - 1], 'seconds')
        } else {
          expectingEnd = true
          for (let j = 0;j < insideMoms.length;j++) {
            if ((j + 1) === insideMoms.length) {
              time += end.diff(insideMoms[j], 'seconds')
              break
            }
            if (j % 2 !== 0)
              time += insideMoms[j].diff(insideMoms[j - 1], 'seconds')
          }
        }


        start.add(1, 'h')
        end.add(1, 'h')
        arr.push(trunc(time / 60, 1))
      }

      return arr
    },
    getLastSeventDateStringArraysByMomentUnit(unit) {
      const tod = mom().startOf(unit)

      const dates = []
      for (let i = 0; i < 7;i++) {
        dates.push(tod.format('Y-M-D'))
        tod.subtract(1, unit)
      }

      return dates
    },
    sumAllDateFocusTimes(arr) {
      const sum = []

      for (let i = 0;i < 24;i++)
        sum.push(0)

      for (const day of arr)
        for (let i = 0;i < 24;i++)
          if (day[i])
            sum[i] += parseFloat(day[i])
      
      return sum
    },
  },
  computed: {
    ...mapState({
      stats: state => state.pomo.stats,
    }),
    ...mapGetters(['l', 'platform']),
    firstTime() {
      return !this.stats
    },
    tod() {
      if (this.firstTime) return null
      return this.stats.dates[TOD_STR]
    },
    lastSevenDays() {
      return this.getLastSeventDateStringArraysByMomentUnit('day')
    },
    lastMonth() {
      const tod = mom()

      const dates = []
      for (let i = 0;i < 28;i++) {
        dates.push(tod.format('Y-M-D'))
        tod.subtract(1, 'd')
      }

      return dates
    },
    focusTimeData() {
      switch (this.focusTime) {
        case 'Day':
          return this.getFocusTimeDataByDate(TOD_STR)
        case 'Week':
          return this.sumAllDateFocusTimes(
            this.lastSevenDays.map(this.getFocusTimeDataByDate)
          )
        case 'Month':
          return this.sumAllDateFocusTimes(
            this.lastMonth.map(this.getFocusTimeDataByDate)
          )
      }
    },
    dailyPomos() {
      if (this.firstTime || !this.tod) return 0
      if (this.tod.completedPomos)
        return this.tod.completedPomos
      return 0
    },
    thisWeekKeys() {
      if (this.firstTime) return 0
      const keys = Object.keys(this.stats.dates || {})
      const weekStart = mom().startOf('week')

      const thisWeek = []
      for (const k of keys)
        if (mom(k, 'Y-M-D').isAfter(weekStart, 'day'))
          thisWeek.push(k)

      return thisWeek
    },
    weeklyPomos() {
      if (this.firstTime) return 0
      return this.thisWeekKeys.reduce((tot, key) => {
        if (!this.stats.dates || !this.stats.dates[key]) return tot + 0
        let comp = this.stats.dates[key].completedPomos
        if (!comp)
          comp = 0
        return tot + comp
      }, 0)
    },
    totalPomos() {
      if (this.firstTime) return 0
      return Object.keys(this.stats.dates).reduce((tot, key) => {
        if (!this.stats.dates || !this.stats.dates[key]) return tot + 0
        let pomos = this.stats.dates[key].completedPomos
        if (!this.stats.dates[key].completedPomos)
          pomos = 0
        return tot + pomos
      }, 0)
    },
    dailyFocus() {
      if (this.firstTime || !this.tod) return '0h'
      const focus = this.tod.focus || 0
      return trunc(focus / 3600, 2) + 'h'
    },
    weeklyFocus() {
      if (this.firstTime) return '0h'
      return (trunc(
        this.thisWeekKeys.reduce((tot, key) => {
          if (!this.stats.dates || !this.stats.dates[key]) return tot + 0
          let focus = this.stats.dates[key].focus
          if (!focus) focus = 0
          return tot + focus
        }, 0) / 3600,
      2)) + 'h'
    },
    totalFocus() {
      if (this.firstTime) return '0h'
      return (trunc(
        Object.keys(this.stats.dates).reduce((tot, key) => {
          if (!this.stats.dates || !this.stats.dates[key]) return tot + 0
          let focus = this.stats.dates[key].focus
          if (!focus) focus = 0
          return tot + focus
        }, 0) / 3600,
      2)) + 'h'
    },
    dailyRest() {
      if (this.firstTime || !this.tod) return '0h'
      const rest = this.tod.rest || 0
      return trunc(rest / 3600, 2) + 'h'
    },
    weeklyRest() {
      if (this.firstTime) return '0h'
      return (trunc(
        this.thisWeekKeys.reduce((tot, key) => {
          if (!this.stats.dates || !this.stats.dates[key]) return tot + 0
          let rest = this.stats.dates[key].rest
          if (!rest) rest = 0
          return tot + rest
        }, 0) / 3600,
      2)) + 'h'
    },
    totalRest() {
      if (this.firstTime) return '0h'
      return (trunc(
        Object.keys(this.stats.dates).reduce((tot, key) => {
          if (!this.stats.dates || !this.stats.dates[key]) return tot + 0
          let rest = this.stats.dates[key].rest
          if (!rest) rest = 0
          return tot + rest
        }, 0) / 3600,
      2)) + 'h'
    },
  },
}

</script>

<style scoped src="@/assets/css/popupAuth.css">
</style>

<style scoped>

.RecentData {
  overflow: auto;
  flex-basis: 750px;
  padding-bottom: 74px;
}

.desktop {
  max-height: 500px;
}

.cont {
  margin: 18px;
  margin-top: 0;
}

.numbers {
  display: flex;
  flex-direction: column;
  height: 325px;
  flex-wrap: nowrap;
}

.display-row {
  display: flex;
  align-items: center;
  justify-content: space-around;
  flex-wrap: nowrap;
  flex-basis: 100%;
}

.cell {
  display: flex;
  justify-content: space-around;
  flex-direction: column;
  height: 70px;
  flex-basis: 130px;
  text-align: center;
}

.float {
  display: flex;
  justify-content: space-between;
}

.num {
  font-size: 2em;
}

.label {
  font-size: .8em;
}

.mobile .label {
  font-size: .65em;
}

.mobile .num {
  font-size: 1.4em;
}

.blue .num {
  color: var(--primary);
}

.green .num {
  color: var(--green);
}

.graph {
  margin-top: 40px;
}

.opt {
  margin-right: 6px;
  transform: scale(1,1);
  transition-duration: .2s;
}

.opt:active {
  transform: scale(1.1,1.1); 
}

.opt.active {
  display: inline-block;
  color: var(--primary);
}

</style>
