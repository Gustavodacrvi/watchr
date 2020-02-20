<template>
  <transition
    @enter='enter'
    @leave='leave'
  >
    <div v-if="getCalendars.length > 0" class="CalendarEvents">
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

import { mapState } from 'vuex'

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
    getIsoString(date, end = false) {
      date = mom(date, 'Y-M-D')
      if (!end) {
        date.hour(0)
        date.minute(0)
        date.second(0)
      } else {
        date.hour(23)
        date.minute(59)
        date.second(59)
      }
      return date.toISOString()
    },
    enter(el, done) {
      const s = el.style

      s.transitionDuration = 0
      s.height = 0
      s.marginTop = 0
      s.padding = 0
      s.opacity = 0

      requestAnimationFrame(() => {
        s.transitionDuration = '.3s'
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
        s.transitionDuration = '.3s'
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
        s.transitionDuration = '.25s'
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
        s.transitionDuration = '.25s'
        s.height = 0
        s.opacity = 0

        setTimeout(done, 250)
      })

    },
    
    getEvents() {
      if (this.date && typeof gapi !== "undefined" && gapi.client && gapi.client.calendar) {
        this.events = []
        const promises = []
        const list = this.calendarList
        
        if (list) {
          for (const calendar of list) {
            promises.push(gapi.client.calendar.events.list({
              calendarId: calendar.id,
              timeMax: this.getFinal,
              timeMin: this.getInit,
              singleEvents: true,
              orderBy: 'startTime',
            }))
          }
          Promise.all(promises).then(responses => {
            for (let i = 0; i < list.length;i++) {
              const res = responses[i]
              const calendar = list[i]
              
              const obj = {
                id: calendar.id,
                name: calendar.summary,
                primary: calendar.primary,
                color: calendar.backgroundColor,
                items: res.result.items.map(el => ({
                  id: el.id,
                  name: el.summary,
                  color: el.backgroundColor,
                  htmlLink: el.htmlLink,
                  start: el.start.dateTime ? mom(el.start.dateTime).format(this.getFormat) : null,
                  end: el.end.dateTime ? mom(el.end.dateTime).format(this.getFormat) : null,
                })),
              }
              if (!calendar.primary)
                this.events.push(obj)
              else this.events.unshift(obj)
            }
          })
        }
      }
    },
  },
  // colorId
  computed: {
    ...mapState(['userInfo', 'calendarList']),
    getHeight() {
      return (this.getCalendars.reduce((tot, cal) => {
        return cal.primary ? tot + (cal.items.length * 25) : tot + ((cal.items.length * 25) + 33)}, 0) + 24) + 'px'
    },
    getInit() {
      if (Array.isArray(this.date))
        return this.getIsoString(this.date[0])
      else
        return this.getIsoString(this.date)
    },
    getCalendars() {
      return this.events.filter(el => el.items.length > 0)
    },
    getFinal() {
      if (Array.isArray(this.date))
        return this.getIsoString(this.date[1], true)
      else
        return this.getIsoString(this.date, true)
    },
    getFormat() {
      return this.userInfo.disablePmFormat ? 'HH:mm' : 'LT'
    },
  },
  watch: {
    date() {
      if (this.date && this.date !== this.date)
        this.getEvents()
      else this.events = []
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
