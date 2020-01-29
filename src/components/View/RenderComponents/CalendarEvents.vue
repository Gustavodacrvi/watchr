<template>
  <transition
    @enter='enter'
    @leave='leave'
  >
    <div v-if="events.length > 0" class="CalendarEvents">
      <transition-group
        @enter='itemEnter'
        @leave='itemLeave'
      >
        <a v-for="item in getItems" :key="item.id"
          class="event rb"
          :class="{hasLink: item.htmlLink}"

          :href="item.htmlLink"
          target="_blank"
        >
          <span class="info">
            {{item.start}} - {{item.end}}&nbsp;
          </span>
          <span class="name">
            {{item.name}}
          </span>
        </a>
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
  mounted() {
    this.getCalendarEvents()
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
        s.transitionDuration = '.3s'
        s.height = this.getHeight
        s.padding = '12px 0'
        s.marginTop = '12px'
        s.opacity = 1

        setTimeout(done, 300)
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
    
    getCalendarEvents() {
      if (this.date && gapi.client.calendar) {
        gapi.client.calendar.events.list({
          calendarId: 'primary',
          singleEvents: true,
          timeMax: this.getFinal,
          timeMin: this.getInit,
          orderBy: 'startTime'
        }).then(res => {
          this.events = res.result.items
          console.log(this.events)
        })
      } else {
        this.events = []
      }
    },
  },
  // colorId
  computed: {
    ...mapState(['userInfo']),
    getHeight() {
      return ((this.events.length * 25) + 24) + 'px'
    },
    getItems() {
      return this.events.map(el => ({
        id: el.id,
        name: el.summary,
        htmlLink: el.htmlLink,
        start: mom(el.start.dateTime).format(this.getFormat),
        end: mom(el.end.dateTime).format(this.getFormat),
      }))
    },
    getInit() {
      const date = mom(this.date, 'Y-M-D')
      date.hour(0)
      date.minute(0)
      date.second(0)
      return date.toISOString()
    },
    getFinal() {
      const date = mom(this.date, 'Y-M-D')
      date.hour(23)
      date.minute(59)
      date.second(59)
      return date.toISOString()
    },
    getFormat() {
      return this.userInfo.disablePmFormat ? 'HH:mm' : 'LT'
    },
    isReady() {
      return this.$store.state.googleCalendarReady
    },
  },
  watch: {
    date() {
      this.getCalendarEvents()
    },
    isReady() {
      setTimeout(() => {
        this.getCalendarEvents()
      })
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

.info {
  color: var(--yellow);
}

</style>
