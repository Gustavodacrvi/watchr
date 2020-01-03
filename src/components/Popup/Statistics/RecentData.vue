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

      <StatsGraph
        title='Recent Pomos'
        :stats='stats'
        :getDataFunction='getCompletedPomosFromDate'
      />
    </div>
  </div>
</template>

<script>

import { mapGetters, mapState } from 'vuex'

import mom from 'moment/src/moment'

import utils from '@/utils'

import StatsGraph from './StatsGraph.vue'

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
    StatsGraph,
  },
  data() {
    return {
      recentPomo: 'Day',
    }
  },
  methods: {
    getCompletedPomosFromDate(date) {
      const data = this.stats.dates[date]
      return (data && data.completedPomos) || 0
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

</style>
