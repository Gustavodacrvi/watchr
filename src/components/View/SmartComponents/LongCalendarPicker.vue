<template>
  <div class="LongCalendarPicker" :class="platform"
    @scroll.prevent
    @whell.prevent
    @touchmove.prevent
  >
    <div class="wrapper" ref="wrapper">
      <div class="week-view last-week" ref="last-week">
        last-week
      </div>
      <div class="week-view this-week" ref='this-week'>
        <div v-for="d in thisWeekDates" :key="d.date"
          class="date-wrapper"
          :class="{active: d.day === activeDay}"
          @click="select(d.date)"
        >
          <div class="weekday">
            {{ d.weekday }}
          </div>
          <div class="day-wrapper cursor remove-highlight">
            <span class="day">
              {{ d.day }}
            </span>
            <CircleBubble
              innerColor='var(--light-gray)'
              outerColor='var(--gray)'
              opacity='0'
            />
          </div>
        </div>
      </div>
      <div class="week-view next-week" ref="next-week">
        next-week
      </div>
    </div>

    <div v-if="isDesktop" class="btn shadow right-btn cursor">
      <Icon class="icon"
        icon='tiny-arrow'
        width='35px'
      />
      <CircleBubble
        innerColor='var(--light-gray)'
        outerColor='var(--gray)'
        opacity='0'
      />
    </div>
    <div v-if="isDesktop" class="btn shadow left-btn cursor">
      <Icon class="icon"
        icon='tiny-arrow'
        width='35px'
      />
      <CircleBubble
        innerColor='var(--light-gray)'
        outerColor='var(--gray)'
        opacity='0'
      />
    </div>
  </div>
</template>

<script>

import Icon from '@/components/Icon.vue'

import mom from 'moment/src/moment'
import { mapGetters } from 'vuex'

const TOD = mom()
const TOD_STR = TOD.format('Y-M-D')

export default {
  components: {
    Icon,
  },
  data() {
    return {
      active: TOD_STR,
      lastWeek: TOD.clone().subtract(1, 'week').startOf('week').format('Y-M-D'),
      weekStart: TOD.clone().startOf('week').format('Y-M-D'),
      nextWeek: TOD.clone().add(1, 'week').startOf('week').format('Y-M-D'),
    }
  },
  mounted() {
    const el = this.$refs['wrapper']
    el.scrollLeft = el.scrollWidth * (1 / 3)
  },
  methods: {
    select(date) {
      this.active = date
    },
  },
  computed: {
    ...mapGetters(['isDesktop', 'platform']),
    mom() {
      return mom(this.active, 'Y-M-D')
    },
    activeDay() {
      return mom(this.active, 'Y-M-D').format('D')
    },
    thisWeekDates() {
      const date = mom(this.weekStart, 'Y-M-D')

      const arr = []
      for (let i = 0;i < 7;i++) {
        arr.push({
          date: date.format('Y-M-D'),
          day: date.format('D'),
          weekday: date.format('ddd'),
        })
        date.add(1, 'd')
      }
      return arr
    },
  },
}

</script>

<style scoped>

.LongCalendarPicker {
  position: relative;
  height: 75px;
  overflow: visible;
  margin: 8px 0;
}

.wrapper {
  position: relative;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.btn {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  transform: translateY(-50%);
  top: 50%;
  background-color: var(--card);
  width: 40px;
  height: 40px;
  border-radius: 1000px;
  overflow: hidden;
  transition-duration: .2s;
}

.btn:hover {
  background-color: var(--light-gray);
}

.right-btn {
  right: -50px;
}

.right-btn .icon {
  transform: rotate(-90deg) translateY(2px);
}

.left-btn {
  left: -50px;
}

.left-btn .icon {
  transform: rotate(90deg) translateY(3px);
}

.week-view {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-around;
}

.date-wrapper {
  height: 100%;
  display: flex;
  justify-content: space-around;
  flex-direction: column;
}

.weekday {
  font-size: .8;
  opacity: .6;
}

.day-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.3em;
  position: relative;
  width: 45px;
  height: 45px;
  border-radius: 1000px;
  overflow: hidden;
  transform: translateX(-8px);
  transition-duration: .2s;
}

.date-wrapper.active .day-wrapper {
  color: var(--primary);
}

.desktop .day-wrapper:hover {
  background-color: var(--card);
  box-shadow: 0 3px 8px rgba(15,15,15,.3);
}

.last-week {
  left: 0;
}

.this-week {
  left: 100%;
}

.next-week {
  left: 200%;
}

</style>
