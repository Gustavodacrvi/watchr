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
  parseMomentToObject(m) {
    return {
      day: m.format('D'),
      month: m.format('MMM').toLowerCase(),
      year: m.format('Y'),
    }
  },
  parseInputToCalendarObject(name) {
    const getDateString = () => {
      if (name.includes(' $'))
        return name.substr(name.indexOf(' $')).replace(' $', '')
      return undefined
    }
    const parseObjectToMoment = ({day,month,year}) => {
      return mom(`${year}-${month}-${day}`, 'Y-MMM-D', true)
    }
    const getTime = (str) => {
      const vals = str.split(' ')
      const isValidTime = (time) => {
        return mom(time, 'H:m', true).isValid()
      }

      for (const v of vals) {
        if (v && v.includes(':') && !v.includes('24:00') && isValidTime(v)) {
          return {time: v, noTimeStr: name.replace(v, '')}
        }
      }
      return {time: null, noTimeStr: str}
    }
    const searchForNextKeyword = (str) => {
      if (str.includes('next ')) {
        const vals = str.split(' ')
        for (let i = 0;i < str.length;i++) {
          const next = vals[i]
          const v = vals[i + 1]
          if (next === 'next' && v) {
            const parsed = parseInt(v, 10)
            if (!isNaN(parsed)) {
              if (parsed > 0 && parsed < 32)
                return this.parseMomentToObject(moment.getNextDateByMonthDay(mom(), parsed))
            } else {
              const m = mom(v, 'ddd', true)
              if (m.isValid())
                return this.parseMomentToObject(moment.nextWeekDay(mom(), v))
            }
          }
        }
      }
      return null
    }
    const getKeyWords = (str) => {
      switch (str) {
        case 'tod': {
          return this.parseMomentToObject(mom())
        }
        case 'tom': {
          return this.parseMomentToObject(tod.clone().add(1, 'd').clone())
        }
      }
      const next = searchForNextKeyword(str)
      if (next) return next
      return null
    }
    const parseDate = (date) => {
      const vals = date.split(' ')
      const getDay = () => {
        for (const v of vals) {
          const parsed = parseInt(v, 10)
          if (v && v.length < 3 && mom(v, 'D', true).isValid() && !isNaN(parsed))
            return parsed
        }
      }
      const getMonth = () => {
        for (const v of vals) {
          const m = mom(v, 'MMM', true)
          if (v && m.isValid())
            return v.toLowerCase()
        }
      }
      const getYear = () => {
        for (const v of vals) {
          const parsed = parseInt(v, 10)
          if (v && v.length < 6 && v.length > 3 && !isNaN(parsed)) {
            const y = parsed
            if (y) return y
          }
        }
      }
      const next = searchForNextKeyword(date)
      if (next) return next
      let d = getDay()
      let m = getMonth()
      let y = getYear()

      if (!d) return null
      if (!d && !m && !y) return null

      if (!m) m = mom().format('MMM')
      if (!y) y = mom().format('Y')

      return {
        day: d,
        month: m,
        year: y,
      }
    }
    const getDeferAndDue = (str) => {
      const getDateNextToKeyWord = (keyWord, except) => {
        const exists = str.includes(keyWord)
        if (exists) {
          const i = str.indexOf(keyWord)
          const sub = str.substr(i + keyWord.length)
          const vals = sub.split(' ')
          let date = ''
          if (vals.length === 2 && isNaN(parseInt(vals[1], 10))) return null
          for (const v of vals) {
            if (v === except) break
            date += v + ' '
          }
          if (!date || date === ' ') return null
          return date
        }
        return null
      }
      let du = getDateNextToKeyWord('due', 'defer')
      let de = getDateNextToKeyWord('defer', 'due')
      let duParsed = null
      let deParsed = null
      if (du) duParsed = parseDate(du)
      if (de) deParsed = parseDate(de)

      if (du && duParsed) du = parseObjectToMoment(duParsed).format('Y-M-D')
      if (de && deParsed) de = parseObjectToMoment(deParsed).format('Y-M-D')

      if (!duParsed) du = null
      if (!deParsed) de = null

      return {
        due: du,
        defer: de,
      }
    }
    const getPeriodicDate = (str) => {
      const vals = str.split(' ')
      const fi = vals[0]
      const se = vals[1]
      const third = vals[2]
      if (fi && fi === 'every' && se) {
        const parsed = parseInt(se, 10)
        if (se === 'day') {
          return {
            type: 'periodic',
            periodic: {
              interval: 1,
              lastCompleteDate: null,
            },
          }
        } else if (!isNaN(parsed)) {
          return {
            type: 'periodic',
            periodic: {
              interval: parsed,
              lastCompleteDate: null,
            }
          }
        } else {
          const weeks = []
          const i = str.indexOf('every')
          const sub = str.substr(i + 5)
          const vs = sub.split(',')
          for (const v of vs) {
            let week = v.trim().toLowerCase()
            if (mom(week, 'ddd', true).isValid() && !weeks.includes(week)) {
              weeks.push(v.trim().toLowerCase())
            }
          }
          if (weeks.length > 0) {
            return {
              type: 'weekly',
              weekly: weeks,
            }
          }
        }
      }
      return null
    }
    const obj = {
      defer: null,
      due: null,

      type: null,
      time: null,
      editDate: mom().format('Y-M-D'),

      specific: null,
      weekly: null,
      periodic: {
        interval: null,
        lastCompleteDate: null
      }
    }
    let str = getDateString()
    const tod = mom()
    if (str) {
      switch (str) {
        case 'next week': {
          obj.defer = moment.getFirstDayOfNextWeekMoment(mom()).format('Y-M-D')
          obj.due = moment.getLastDayOfNextWeekMoment(mom()).format('Y-M-D')
          return obj
        }
        case 'next weekend': {
          const sat = moment.nextWeekDay(mom(), 'Saturday')
          obj.defer = sat.format('Y-M-D')
          obj.due = sat.clone().add(1, 'd').format('Y-M-D')
          return obj
        }
        case 'next month': {
          obj.defer = moment.getFirstDayOfNextMonth(mom()).format('Y-M-D')
          obj.due = moment.getLastDayOfNextMonth(mom()).format('Y-M-D')
          return obj
        }
      }
      
      str = str.toLowerCase()

      const {time, noTimeStr} = getTime(str)
      str = noTimeStr
      obj.time = time
      const {defer, due} = getDeferAndDue(noTimeStr)

      obj.defer = defer
      obj.due = due
      if (defer || due) return obj

      const per = getPeriodicDate(noTimeStr)
      if (per) {
        obj.type = per.type
        if (per.periodic) {
          obj.periodic = per.periodic
        } else if (per.weekly) {
          obj.weekly = per.weekly
        }
        return obj
      }
      
      const keys = getKeyWords(noTimeStr)
      if (keys) {
        obj.type = 'specific'
        const momStr = parseObjectToMoment(keys).format('Y-M-D')
        obj.specific = momStr
        return obj
      }
      const parsedDate = parseDate(noTimeStr)
      if (parsedDate) {
        obj.type = 'specific'
        obj.specific = parseObjectToMoment(parsedDate).format('Y-M-D')
      }
    }
    return obj
  },
  parseCalendarObjectToString(obj) {
    let str = ''
    const getHumanDate = (str) => {
      const tod = mom()
      const sameDay = (mom1, mom2) => {
        return mom1.isSame(mom2, 'day')
      }
      
      let date = mom(str, 'Y-M-D', true)
      if (sameDay(tod, date)) return 'Today'
      if (sameDay(mom().add(1, 'day'), date)) return 'Tomorrow'
      if (!tod.isSame(date, 'year')) return date.format('MMM Do, ddd, Y')
      if (!tod.isSame(date, 'month')) return date.format('MMM Do, ddd')
      return date.format('Do, ddd')
    }
    switch (obj.type) {
      case 'specific': {
        str += getHumanDate(obj.specific)
        break
      }
      case 'periodic': {
        if (obj.periodic.interval === 1)
          str = `Every day`
        else str = `Every ${obj.periodic.interval} days`
        break
      }
      case 'weekly': {
        str = 'Every '
        obj.weekly.forEach((week, i) => {
          str += week
          if (i !== obj.weekly.length - 1)
            str += ', '
        })
        break
      }
    }
    if (obj.defer) {
      if (str !== '') str += ', '
      str += 'Defer ' + getHumanDate(obj.defer)
    }
    if (obj.due) {
      if (str !== '') str += ', '
      str += 'Due ' + getHumanDate(obj.due)
    }
    
    return str
  }
}
