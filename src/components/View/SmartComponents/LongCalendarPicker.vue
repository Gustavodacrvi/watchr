<template>
  <div class="LongCalendarPicker" :class="platform"
    @scroll.prevent
    @whell.prevent
    @touchmove.prevent
  >
    <div class="ball" :style="{left}"></div>
    <div class="wrapper" ref="wrapper">
      <div class="week-view last-week" ref="last-week">
        <div v-for="d in lastWeekDates" :key="d.date"
          class="date-wrapper"
          :class="{active: d.day === activeDay, notActive: d.day !== activeDay, tod: todayDay === d.day}"
          :ref="d.date"
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
              innerColor='var(--white)'
              outerColor='white'
              opacity='0'
            />
          </div>
        </div>
      </div>
      <div class="week-view this-week" ref='this-week'>
        <div v-for="d in thisWeekDates" :key="d.date"
          class="date-wrapper"
          :class="{active: d.day === activeDay, notActive: d.day !== activeDay}"
          :ref="d.date"
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
              innerColor='var(--white)'
              outerColor='white'
              opacity='0'
            />
          </div>
        </div>
      </div>
      <div class="week-view next-week" ref="next-week">
        <div v-for="d in nextWeekDates" :key="d.date"
          class="date-wrapper"
          :class="{active: d.day === activeDay}"
          :ref="d.date"
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
              innerColor='var(--white)'
              outerColor='white'
              opacity='0'
            />
          </div>
        </div>
      </div>
    </div>

    <div v-if="isDesktop"
      class="btn shadow right-btn cursor"
      @click="swipeRight"
    >
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
    <div v-if="isDesktop"
      class="btn shadow left-btn cursor"
      @click="swipeLeft"
    >
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
      weekStart: TOD.clone().startOf('week').format('Y-M-D'),
      left: 0,
    }
  },
  mounted() {
    const el = this.$refs['wrapper']
    el.scrollLeft = el.scrollWidth * (1 / 3)

    this.moveBall()
  },
  methods: {
    moveBall() {
      setTimeout(() => {
        const el = this.$refs[this.active][0]

        this.left = (el.offsetLeft - 8) + 'px'
      })
    },
    select(date) {
      this.active = date
    },
    swipeLeft() {
      const width = this.$refs['wrapper'].clientWidth
      const t = this.$refs['this-week'].style
      const n = this.$refs['last-week'].style

      t.transitionDuration = '.4s'
      n.transitionDuration = '.4s'

      t.transform = `translateX(${width}px)`
      n.transform = `translateX(${width}px)`

      setTimeout(() => {
        t.transitionDuration = '0s'
        n.transitionDuration = '0s'
        this.weekStart = this.lastWeek
        this.active = this.weekStart
        t.transform = `translateX(0px)`
        n.transform = `translateX(0px)`
      }, 610)
    },
    swipeRight() {
      const width = this.$refs['wrapper'].clientWidth
      const t = this.$refs['this-week'].style
      const n = this.$refs['next-week'].style

      t.transitionDuration = '.4s'
      n.transitionDuration = '.4s'

      t.transform = `translateX(-${width}px)`
      n.transform = `translateX(-${width}px)`

      setTimeout(() => {
        t.transitionDuration = '0s'
        n.transitionDuration = '0s'
        this.weekStart = this.nextWeek
        this.active = this.weekStart
        t.transform = `translateX(0px)`
        n.transform = `translateX(0px)`
      }, 610)
    },
    getWeekDates(weekStart) {
      const date = mom(weekStart, 'Y-M-D')

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
  computed: {
    ...mapGetters(['isDesktop', 'platform']),
    todayDay() {
      return mom(TOD_STR, 'Y-M-D').format('D')
    },
    mom() {
      return mom(this.active, 'Y-M-D')
    },
    activeDay() {
      return mom(this.active, 'Y-M-D').format('D')
    },
    lastWeek() {
      return mom(this.weekStart, 'Y-M-D').subtract(1, 'week').startOf('week').format('Y-M-D')
    },
    nextWeek() {
      return mom(this.weekStart, 'Y-M-D').add(1, 'week').startOf('week').format('Y-M-D')
    },
    lastWeekDates() {
      return this.getWeekDates(this.lastWeek)
    },
    thisWeekDates() {
      return this.getWeekDates(this.weekStart)
    },
    nextWeekDates() {
      return this.getWeekDates(this.nextWeek)
    },
  },
  watch: {
    active() {
      this.moveBall()
    },
  }
}

</script>

<style scoped>

.LongCalendarPicker {
  position: relative;
  height: 80px;
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
  transform: translateX(0px);
  transition-timing-function: ease-out;
  transition-duration: .6s;
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

.ball {
  width: 45px;
  height: 45px;
  border-radius: 1000px;
  background-color: var(--purple);
  box-shadow: 0 0 28px rgba(161, 96, 235, .4);
  position: absolute;
  bottom: 4px;
  transition-duration: .3s; 
}

.date-wrapper.active .day-wrapper {
  color: white !important;
}

.date-wrapper.active .day-wrapper {
  color: var(--primary);
}

.desktop .day-wrapper.notActive:hover {
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
