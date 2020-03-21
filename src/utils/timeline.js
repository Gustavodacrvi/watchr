
import mom from 'moment'

export default {
  convertOffsetToMin(offset, height) {
    return offset * 1440 / height
  },
  convertMinToOffset(min, height) {
    return height * min / 1440
  },
  formatMin(min, autoTimeStyleFormat = true) {
    return mom(`${Math.floor(min / 60)}-${min % 60}`, 'HH:mm').format(
      autoTimeStyleFormat ? this.format : 'HH:mm',
    )
  },
  getFullMin(str) {
    const split = str.split(':')
    return (parseInt(split[0], 10) * 60) + parseInt(split[1], 10)
  },

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
  getEvents(vm, date) {
    return new Promise(solve => {
      const final = this.getIsoString(date, true)
      const init = this.getIsoString(date)
  
      if (date && typeof gapi !== "undefined" && gapi.client && gapi.client.calendar) {
        const state = vm.$store.state
  
        const eventsArr = []
        const promises = []
        const getFormat = state.userInfo.disablePmFormat ? 'HH:mm' : 'LT'
  
        const list = state.calendarList
  
        if (list) {
          for (const calendar of list) {
            promises.push(gapi.client.calendar.events.list({
              calendarId: calendar.id,
              timeMax: final,
              timeMin: init,
              singleEvents: true,
              orderBy: 'startTime',
            }))
          }
          Promise.all(promises).then(responses => {
            for (let i = 0; i < list.length;i++) {
              const res = responses[i]
              const calendar = list[i]
              
              const colors = state.calendarColorIds
              const obj = {
                id: calendar.id,
                name: calendar.summary,
                primary: calendar.primary,
                color: calendar.backgroundColor,
                items: res.result.items.map(el => ({
                  id: el.id,
                  name: el.summary,
                  color: (colors[el.colorId] && colors[el.colorId].background) || '',
                  htmlLink: el.htmlLink,
                  start: el.start.dateTime ? mom(el.start.dateTime).format(getFormat) : null,
                  end: el.end.dateTime ? mom(el.end.dateTime).format(getFormat) : null,
                })),
              }
              if (!calendar.primary)
                eventsArr.push(obj)
              else eventsArr.unshift(obj)
            }
  
            solve(eventsArr)
            
          })
        }
      }
    })
  },
}
