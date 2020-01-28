<template>
  <div class="CalendarEvents">
    {{events.length}}
    {{date}}
  </div>
</template>

<script>

import mom from 'moment'

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
    getCalendarEvents() {
      if (this.date) {
        gapi.client.calendar.events.list({
          calendarId: 'primary',
          singleEvents: true,
          timeMax: this.getFinal,
          timeMin: this.getInit,
          orderBy: 'startTime'
        }).then(res => {
          this.events = res.result.items
        })
      }
    },
  },
  computed: {
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
  },
  watch: {
    date() {
      this.getCalendarEvents()
    },
  },
}

</script>

<style scoped>

</style>
