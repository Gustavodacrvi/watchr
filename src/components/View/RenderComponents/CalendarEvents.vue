<template>
  <transition
    @enter='enter'
    @leave='leave'
  >
    <div v-if="getCalendars.length > 0 && allowCalendar" class="CalendarEvents">
      <transition-group
        @enter='itemEnter'
        @leave='itemLeave'
        tag="div"
      >
        <div v-for="cal in getCalendars"
          :key="cal.id"
          class="calendar"
        >
          <div v-if="!cal.primary" class="calendar-name-wrapper">
            <span class="calendar-line"></span>
            <span class="calendar-name">{{ cal.name }}</span>
          </div>
          <a v-for="item in cal.items" :key="item.id"
            class="event rb"
            :class="{hasLink: item.htmlLink}"

            :href="item.htmlLink"
            target="_blank"
          >
            <span v-if="item.start && item.end" class="info" :style="{color: item.color || cal.color}">
              {{item.start}} - {{item.end}}&nbsp;
            </span>
            <span v-if="item.start && item.end" class="name">
              {{item.name}}
            </span>
            <span v-else class="name" :style="{color: item.color || cal.color}">
              {{item.name}}
            </span>
          </a>
        </div>
      </transition-group>
    </div>
  </transition>
</template>

<script>

import mom from 'moment'

import timeline from '@/utils/timeline'

import { mapState, mapGetters } from 'vuex'

export default {
  props: ['date'],
  data() {
    return {
      events: [],
    }
  },
  created() {
    this.getEvents()
  },
  methods: {
    enter(el, done) {
      const s = el.style

      s.transitionDuration = 0
      s.height = 0
      s.marginTop = 0
      s.padding = 0
      s.opacity = 0

      requestAnimationFrame(() => {
        s.transitionDuration = '.2s'
        s.height = this.getHeight
        s.padding = '12px 0'
        s.marginTop = '12px'
        s.opacity = 1

        setTimeout(() => {
          s.height = 'auto'
          done()
        }, 305)
      })

    },
    leave(el, done) {

      const s = el.style

      s.transitionDuration = 0
      s.height = this.getHeight
      s.padding = '12px 0'
      s.marginTop = '12px'
      s.opacity = 1

      requestAnimationFrame(() => {
        s.transitionDuration = '.2s'
        s.height = 0
        s.marginTop = 0
        s.padding = 0
        s.opacity = 0

        setTimeout(done, 300)
      })

    },
    itemEnter(el, done) {

      const s = el.style
      s.transitionDuration = 0
      s.height = 0
      s.opacity = 0

      requestAnimationFrame(() => {
        s.transitionDuration = '.15s'
        s.height = '25px'
        s.opacity = 1

        setTimeout(done, 250)
      })

    },
    itemLeave(el, done) {

      const s = el.style
      s.transitionDuration = 0
      s.height = '25px'
      s.opacity = 1

      requestAnimationFrame(() => {
        s.transitionDuration = '.15s'
        s.height = 0
        s.opacity = 0

        setTimeout(done, 250)
      })

    },
    
    async getEvents() {
      this.events = await timeline.getEvents(this, this.getDate)
    },
    getViewEvents() {
      console.log(3)
      this.events = this.viewEvents
    },
    toggleEvents() {
      if (this.getDate && this.allowCalendar) {
        
        this.date ? this.getEvents() : this.getViewEvents()
        
      } else this.events = []
    },
  },
  // colorId
  computed: {
    ...mapState(['userInfo', 'calendarList', 'allowCalendar', 'calendarColorIds', 'viewEvents']),
    ...mapGetters(['calendarDate']),
    getHeight() {
      return (this.getCalendars.reduce((tot, cal) => {
        return cal.primary ? tot + (cal.items.length * 25) : tot + ((cal.items.length * 25) + 33)}, 0) + 24) + 'px'
    },
    getDate() {
      if (Array.isArray(this.getDate))
        return this.getDate[0]
      else
        return this.getDate
    },
    getDate() {
      return this.date || this.calendarDate
    },
    getCalendars() {
      return this.events.filter(el => el.items.length > 0)
    },
    getFormat() {
      return this.userInfo.disablePmFormat ? 'HH:mm' : 'LT'
    },
  },
  watch: {
    getDate() {
      this.toggleEvents()
    },
    allowCalendar() {
      this.toggleEvents()
    },
    calendarList() {
      this.getEvents()
    },
  },
}

</script>

<style scoped>

.CalendarEvents {
  margin-top: 12px;
  background-color: var(--sidebar-color);
  padding: 12px 0;
  border-radius: 14px;
  position: relative;
  z-index: 4;
}

.calendar-name {
  height: 100%;
  display: inline-flex;
  align-items: center;
  background-color: var(--sidebar-color);
  position: relative;
  z-index: 2;
  padding: 0 6px;
}

.calendar-name-wrapper {
  font-size: .8em;
  opacity: .6;
  height: 25px;
  margin: 4px 12px;
  position: relative;
}

.calendar-line {
  position: absolute;
  z-index: 1;
  opacity: .4;
  width: 100%;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  height: 2px;
  background-color: var(--fade);
}

.event {
  text-decoration: none;
  height: 25px;
  margin: 0 12px;
  padding: 0 6px;
  font-size: .95em;
  display: flex;
  color: var(--txt);
  align-items: center;
}

.hasLink:hover {
  background-color: var(--dark);
  cursor: pointer;
}

</style>
