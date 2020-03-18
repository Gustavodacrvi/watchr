<template>
  <div class="Calendar">
    <div class="header">
      <div class="current-date">
        {{ currentYear }} {{ currentMonth }}
      </div>
      <div>
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
    <div
      class="grid"
      ref='grid'
      
      data-name='scheduler'
    >
      <div class='week-day' key='s'>S</div>
      <div class='week-day' key='m'>M</div>
      <div class='week-day' key='t'>T</div>
      <div class='week-day' key='w'>W</div>
      <div class='week-day' key='tu'>T</div>
      <div class='week-day' key='f'>F</div>
      <div class='week-day' key='sa'>S</div>

      <div v-for="i in firstWeekDayRange" :key="i" class="day dead">{{ i }}</div>
      <Date v-for="i in daysInMonth" :key="i"
        class="day num"
        :class="{active: selectedDay === i}"
        :date='i'
        :allowTaskAdd='allowTaskAdd'
        :year='currentYear'
        :month='currentMonthNumber'
        @click.native="selectDate(i)"
      />
    </div>
  </div>
</template>

<script>

import { Sortable } from 'sortablejs'

import Date from "./Date.vue"

import mom from 'moment'

import utils from "@/utils/"
import { mapState } from 'vuex'

const TOD = mom()
const TOD_STR = TOD.format('Y-M-D')

export default {
  components: {
    Date,
  },
  props: ['value', 'allowTaskAdd'],
  data() {
    return {
      current: this.defaultDate || TOD_STR,
      selected: this.defaultDate || TOD_STR,

      sortable: null,
    }
  },
  mounted() {
    if (this.allowTaskAdd) {
      this.sortable = new Sortable(this.$refs.grid, {
        group: {
          name: 'scheduler',
          pull: (e) => false,
          put: (j,o,item) => {
            const d = item.dataset
            const type = d.type
            if (type === 'Task') return true
          },
        },
        onAdd: evt => {
          const {ids, targetElement} = utils.getInfoFromAddSortableEvt(evt, 'Date')
          this.$store.dispatch('task/saveTasksById', {
            ids: this.selectedItems.slice(),
            task: {
              calendar: {
                type: 'specific',
                specific: targetElement.dataset.date,

                editDate: TOD_STR,
                begins: TOD_STR,
              }
            },
          })
        },
      })
    }
  },
  beforeDestroy() {
    if (this.sortable)
      this.sortable.destroy()
  },
  methods: {
    selectDate(day) {
      this.saveDate(this.currentMoment.clone().date(day).format('Y-M-D'))
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
    saveDate(date) {
      this.selected = date
      this.$emit('input', date)
    },
  },
  computed: {
    ...mapState(['selectedItems']),
    firstWeekDayRange() {
      return parseInt(this.currentMoment.clone().startOf('month').format('d'), 10)
    },
    selectedDay() {
      if (
        !this.currentMoment.isSame(this.selectedMoment, 'month') ||
        !this.currentMoment.isSame(this.selectedMoment, 'year')
      )
        return false
      return parseInt(this.selectedMoment.format('D'), 10)
    },
    daysInMonth() {
      return this.currentMoment.daysInMonth()
    },
    currentYear() {
      return this.currentMoment.format('YYYY')
    },
    currentMonth() {
      return this.currentMoment.format('MMM')
    },
    currentMonthNumber() {
      return this.currentMoment.format('M')
    },
    selectedMoment() {
      return mom(this.selected, 'Y-M-D')
    },
    currentMoment() {
      return mom(this.current, 'Y-M-D')
    },
  },
  watch: {
    current() {
      setTimeout(() => {
        this.$emit('calc')
      })
    },
    value() {
      let reset
      if (this.selected !== this.value)
        reset = true
      this.selected = this.value

      if (reset)
        this.resetDate()
    },
  },
}

</script>

<style>

.Calendar .sortable-ghost {
  height: 0;
  width: 0;
  max-height: 0;
  max-width: 0;
  visibility: hidden;
  display: none;
}

</style>

<style scoped>

.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.arrow-left {
  margin-right: 8px;
  transform: rotate(90deg);
}

.arrow-right {
  margin-left: 8px;
  transform: rotate(-90deg);
}

.current-date {
  font-size: 1.5em;
  color: var(--purple);
}

.grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: 36px;
}

.week-day, .day {
  display: flex;
  justify-content: center;
  align-items: center;
}

.week-day {
  color: var(--fade);
  font-size: 1em;
}

.day {
  border-radius: 8px;
  transition-duration: .2s;
  font-size: 1.05em;
}

.dead {
  color: var(--fade);
}

.num:hover, .num.active, .dragover {
  background-color: var(--light-gray);
  color: var(--purple);
  user-select: none;
}

</style>
