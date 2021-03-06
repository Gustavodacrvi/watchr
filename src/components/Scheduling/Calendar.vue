<template>
  <div class="Calendar">
    <div class="header">
      <div class="current-date">
        {{ currentYear }} {{ currentMonth }}
      </div>
      <div v-if="allowTaskAdd"
        class="msg"
      >
        <span v-if="actionType === 'select'">
          Select date
        </span>
        <span v-else-if="actionType === 'navigate'">
          Go to date
        </span>
        <span v-else-if="actionType === 'schedule'">
          Schedule items
        </span>
      </div>
      <div>
        <Icon
          class="arrow-left icon cursor primary-hover"
          icon="tiny-arrow"
          width="12px"
          @click="previousMonth"
        />
        <Icon
          class="icon cursor primary-hover"
          icon="tiny-circle"
          width="8px"
          @click="resetDate"
        />
        <Icon
          class="arrow-right primary-hover cursor"
          icon="tiny-arrow"
          width="12px"
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

      <div v-for="i in firstWeekDayRange" :key="i + 'dead'" class="day dead">{{ i }}</div>
      <Date v-for="i in daysInMonth" :key="i"
        class="day num"
        :class="{active: selectedDay === i}"
        :date='i'
        :allowTaskAdd='allowTaskAdd'
        :year='currentYear'
        :month='currentMonthNumber'

        :actionType='actionType'

        @save='saveTaskDates'
        @select="saveDate"
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

import { mapState, mapGetters } from 'vuex'

const TOD = mom()
const TOD_STR = TOD.format('Y-M-D')

export default {
  components: {
    Date,
  },
  props: ['value', 'allowTaskAdd'],
  data() {
    return {
      current: this.value || TOD_STR,
      selected: this.value || TOD_STR,

      sortable: null,
    }
  },
  mounted() {
    this.$emit('input', this.selected)
    if (this.allowTaskAdd) {
      this.sortable = new Sortable(this.$refs.grid, {
        group: {
          name: 'scheduler',
          pull: false,
          put: (j,o,item) => {
            const d = item.dataset
            const type = d.type
            if (type === 'Task') return true
          },
        },
        onAdd: evt => {
          const {ids, targetElement} = utils.getInfoFromAddSortableEvt(evt, 'Date')
          if (targetElement)
            this.saveTaskDates(targetElement.dataset.date, ids)
        },
      })
    }
  },
  beforeDestroy() {
    if (this.sortable)
      this.sortable.destroy()
  },
  methods: {
    saveTaskDates(date, ids) {
      this.$store.dispatch('task/saveTasksById', {
        ids: (ids && ids.length === 1) ? ids : this.selectedItems.slice(),
        task: {
          calendar: {
            type: 'specific',
            specific: date.format ? date.format('Y-M-D') : date,

            editDate: TOD_STR,
            begins: TOD_STR,
          }
        },
      })
      this.$store.commit('clearSelected')
    },
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
    },
  },
  computed: {
    ...mapState(['selectedItems', 'isOnControl']),
    hasSelected() {
      return this.selectedItems.length > 0
    },

    actionType() {
      if (this.select) return 'select'
      if (this.schedule) return 'schedule'
      if (this.navigate) return 'navigate'
    },

    select() {
      return !this.isOnControl && !this.hasSelected || (this.isOnControl && this.hasSelected)
    },
    schedule() {
      return this.hasSelected && !this.isOnControl
    },
    navigate() {
      return !this.hasSelected && this.isOnControl
    },

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
    selected() {
      this.$emit('input', this.selected)
    },
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

.msg {
  color: var(--fade);
  font-size: .9em;
}

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
  grid-auto-rows: 25px;
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
  border-radius: 4px;
  transition-duration: .15s;
  font-size: 1.15em;
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
