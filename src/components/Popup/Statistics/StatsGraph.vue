<template>
  <div class="graph">
    <div class="float">
      <div>
        <h4>
          {{title}}
        </h4>
      </div>
      <div>
        <span class="opt cursor remove-highlight" :class="{active: type === 'Day'}" @click="type = 'Day'">
          Day
        </span>
        <span class="opt cursor remove-highlight" :class="{active: type === 'Week'}" @click="type = 'Week'">
          Week
        </span>
        <span class="opt cursor remove-highlight" :class="{active: type === 'Month'}" @click="type = 'Month'">
          Month
        </span>
      </div>
    </div>
    <Graph
      :data='data'
      :labels='labels'
    />
  </div>
</template>

<script>

import mom from 'moment'

import Graph from '@/components/Chartjs/Graph.vue'

export default {
  components: {
    Graph,
  },
  props: ['title', 'stats', 'getDataFunction', 'dataReducer'],
  data() {
    return {
      type: 'Day'
    }
  },
  methods: {
    getLastSeventDateStringArraysByMomentUnit(unit) {
      const tod = mom().startOf(unit)

      const dates = []
      for (let i = 0; i < 7;i++) {
        dates.push(tod.format('Y-M-D'))
        tod.subtract(1, unit)
      }

      return dates
    },
    mapEachWeekday(firstDayOfTheWeek, callback) {
      const arr = []
      const tod = mom(firstDayOfTheWeek, 'Y-M-D')

      for (let i = 0;i < 7;i++) {
        arr.push(callback(tod.format('Y-M-D')))
        tod.add(1, 'd')
      }

      return arr
    },
    mapEachMonthDay(firstDayOfTheMonth, callback) {
      const tod = mom(firstDayOfTheMonth, 'Y-M-D')
      const days = tod.daysInMonth()

      const arr = []

      for (let i = 0;i < days;i++) {
        arr.push(callback(tod.format('Y-M-D')))
        tod.add(1, 'd')
      }

      return arr
    },
  },
  computed: {
    data() {
      if (!this.stats) return [0,0,0,0,0,0,0]
      switch (this.type) {
        case 'Day':
          return this.lastSevenDays.map(this.getDataFunction).reverse()
        case 'Week':
          return this.lastSevenWeeks.map(firstDay => 
            this.mapEachWeekday(firstDay, this.getDataFunction).reduce(this.dataReducer, 0)
          ).reverse()
        case 'Month':
          return this.lastSevenMonths.map(firstDay =>
            this.mapEachMonthDay(firstDay, this.getDataFunction).reduce(this.dataReducer, 0)
          ).reverse()
      }
    },
    labels() {
      if (!this.stats) return ['28','29','30','31','1','2','3']
      switch (this.type) {
        case 'Day':
          return this.lastSevenDays.map(dt => mom(dt, 'Y-M-D').format('D')).reverse()
        case 'Week':
          return this.lastSevenWeeks.map(dt => mom(dt, 'Y-M-D').format('M.D')).reverse()
        case 'Month':
          return this.lastSevenMonths.map(dt => mom(dt, 'Y-M-D').format('MMM')).reverse()
      }
    },
    lastSevenDays() {
      return this.getLastSeventDateStringArraysByMomentUnit('d')
    },
    lastSevenWeeks() {
      return this.getLastSeventDateStringArraysByMomentUnit('week')
    },
    lastSevenMonths() {
      return this.getLastSeventDateStringArraysByMomentUnit('month')
    },
  },
}

</script>

<style scoped>

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

.float {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.graph {
  margin-top: 40px;
}

</style>
