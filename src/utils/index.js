import mom from "moment"
import moment from "./moment"

/*
  time: null,
  defer: null,
  due: null
  type: 'specific', 'periódico',
  editDate: mom().format('Y-M-D'),
  specific: m.format('Y-M-D'),
  weekly: null,
  periodic: {
    interval: null,
    lastCompleteDate: null
  }
*/

export default {
  getDataFromFirestoreSnapshot(state, changes, arrName) {
    for (const change of changes)
      if (change.type === 'added') {
        const el = state[arrName].find(el => el.id === change.doc.id)
        if (!el)
          state[arrName].push({...change.doc.data(), id: change.doc.id})
      } else if (change.type === 'removed') {
        const index = state[arrName].findIndex(el => el.id === change.doc.id)
        state[arrName].splice(index, 1)
      } else {
        const index = state[arrName].findIndex(el => el.id === change.doc.id)
        state[arrName].splice(index, 1, {...change.doc.data(), id: change.doc.id})
      }
  },
  checkMissingIdsAndSortArr(order, arr) {
    const items = []
    for (const id of order) {
      const item = arr.find(el => el.id === id)
      if (item) items.push(item)
    }
    for (const item of arr) {
      if (!order.includes(item.id))
        items.push(item)
    }
    const ids = new Set()
    const ordered = []
    for (const item of items) {
      if (!ids.has(item.id)) {
        ids.add(item.id)
        ordered.push(item)
      }
    }
    return ordered
  },
  parseInputToCalendarObject(name) {
    const getDateString = () => {
      if (name.includes(' $'))
        return name.substr(name.indexOf(' $')).replace(' $', '')
      return undefined
    }
    const getTime = (vals) => {
      const isValidTime = (time) => {
        return mom(time, 'H:m').isValid()
      }
      
      for (const v of vals) {
        if (v.includes(':') && !v.includes('24:00') && isValidTime(v))
          return time
      }
      return null
    }
    const str = getDateString()

    const obj = {
      defer: null,
      due: null,

      type: null,
      time: null,
      editDate: null,

      specific: null,
      weekly: null,
      periodic: {
        interval: null,
        lastCompleteDate: null
      }
    }
    const tod = mom()

    if (str) {
      const vals = str.split(' ')

      obj.time = getTime(vals)

      switch (str) {
        case 'Today': {
          obj.type = 'specific'
          obj.editDate = tod.format('Y-M-D')
          obj.specific = tod.format('Y-M-D')
          return obj
        }
        case 'Tomorrow': {
          obj.type = 'specific'
          const date = tod.clone().add(1, 'd').format('Y-M-D')
          obj.editDate = date
          obj.specific = date
          return obj
        }
        case 'Next week': {
          obj.due = moment.getFirstDayOfNextWeekMoment(mom())
          obj.defer = moment.getLastDayOfNextWeekMoment(mom())
        }
      }
    }
    return undefined
  },
  parseCalendarObjectToString(obj) {
    switch (obj.type) {
      case 'specific': {
        const tod = mom()
        const sameDay = (mom1, mom2) => {
          return mom1.isSame(mom2, 'day')
        }
        
        let date = mom(obj.specific, 'Y-M-D')
        if (sameDay(tod, date)) str = 'Today'
        else if (sameDay(mom().add(1, 'day'), date)) str = 'Tomorrow'
        else if (!tod.isSame(date, 'year')) return date.format('MMM Do, ddd, Y')
        else if (!tod.isSame(date, 'month')) return date.format('MMM Do, ddd')
        else return date.format('Do, ddd')
      }
      case 'periodic': {
        if (obj.periodic.interval === 1)
          return `every day`
        return `every ${obj.periodic.interval} days`
      }
      case 'weekly': {
        let str = 'every '
        obj.weekly.forEach((week, i) => {
          str += week
          if (i !== obj.weekly.length - 1)
            str += ', '
        })
        return str
      }
    }
  }
}
