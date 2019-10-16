import mom from "moment"
import moment from "./moment"

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
  checkMissingIdsAndSortArr(order, arr, property) {
    let name = 'id'
    if (property) name = property
    
    const items = []
    for (const id of order) {
      const item = arr.find(el => el[name] === id)
      if (item) items.push(item)
    }
    for (const item of arr) {
      if (!order.includes(item[name]))
        items.push(item)
    }
    const ids = new Set()
    const ordered = []
    for (const item of items) {
      if (!ids.has(item[name])) {
        ids.add(item[name])
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
  parseInputToCalendarObject(name, language) {
    if (!language) throw 'Missing language object'
    const l = language
    const isStrNumber = str => !isNaN(parseInt(str, 10))
    const getDateString = () => {
      if (name.includes(' $'))
        return name.substr(name.indexOf(' $')).replace(' $', '')
      return undefined
    }
    const parseObjectToMoment = ({day,month,year}) => {
      return mom(`${year}-${month}-${day}`, 'Y-MMM-D', true)
    }
    const getTime = str => {
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
    const searchForNextKeyword = str => {
      const key = l['CalParserNext']
      if (str.includes(`${key} `)) {
        const vals = str.split(' ')
        for (let i = 0;i < str.length;i++) {
          const next = vals[i]
          const v = vals[i + 1]
          if (next === key && v) {
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
    const getKeyWords = str => {
      const today = l['CalParserToday']
      const tomorrow = l['CalParserTomorrow']
      switch (str) {
        case today: {
          return this.parseMomentToObject(mom())
        }
        case tomorrow: {
          return this.parseMomentToObject(tod.clone().add(1, 'd').clone())
        }
      }
      const next = searchForNextKeyword(str)
      if (next) return next
      return null
    }
    const parseDate = date => {
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

      const onlyHaveTheDay = d && !m && !y

      if (onlyHaveTheDay) d = null

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
    const getDeferAndDue = str => {
      const keyDefer = l['CalParserDefer']
      const keyDue = l['CalParserDue']
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
      let du = getDateNextToKeyWord(keyDue, keyDefer)
      let de = getDateNextToKeyWord(keyDefer, keyDue)
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
    const getPeriodicDate = str => {
      const keyEvery = l['CalParserEvery']
      const dayKey = l['CalParserDayKey']
      const timesKey = l['CalParserTimesKeyword']
      
      const vals = str.split(' ')
      const fi = vals[0]
      const se = vals[1]
      if (fi && fi === keyEvery && se) {
        const parsed = parseInt(se, 10)
        if (se === dayKey) {
          return {
            type: 'periodic',
            lastCompleteDate: null,
            periodic: 1,
          }
        } else if (!isNaN(parsed)) {
          return {
            type: 'periodic',
            lastCompleteDate: null,
            periodic: parsed,
          }
        } else {
          const weeks = []
          const i = str.indexOf(keyEvery)
          let sub = str.substr(i + 5)
          const spaceSplit = sub.split(' ')
          const len = spaceSplit.length
          if (spaceSplit[len - 1] === timesKey && isStrNumber(spaceSplit[len - 2])) {
            sub = '' 
            for (let i = 0; i < len - 2;i++) {
              sub += spaceSplit[i]
            }
          }
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
    const getTimesKeyword = str => {
      const keyword = l['CalParserTimesKeyword']
      
      const values = str.split(' ')
      for (let i = 0;i < values.length;i++) {
        const times = values[i]
        const key = values[i + 1]
        const parsed = parseInt(times, 10)
        if (!isNaN(parsed) && key === keyword && parsed > 0) return parsed
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
      lastCompleteDate: null,
      times: null,
      periodic: null,
    }
    let str = getDateString()
    const tod = mom()
    if (str) {
      if (str.includes(l['CalParserPersistentKey']) || str.includes(l['CalParserPerKey'])) obj.persistent = true
      
      const keyNextWeek = l['CalParserNextweek']
      const keyNextWeekend = l['CalParserNextweekend']
      const keyNextMonth = l['CalParserNextmonth']
      
      switch (str) {
        case keyNextWeek: {
          obj.defer = moment.getFirstDayOfNextWeekMoment(mom()).format('Y-M-D')
          obj.due = moment.getLastDayOfNextWeekMoment(mom()).format('Y-M-D')
          return obj
        }
        case keyNextWeekend: {
          const sat = moment.nextWeekDay(mom(), 'Saturday')
          obj.defer = sat.format('Y-M-D')
          obj.due = sat.clone().add(1, 'd').format('Y-M-D')
          return obj
        }
        case keyNextMonth: {
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
      
      obj.times = getTimesKeyword(noTimeStr)

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
  getHumanReadableDate(str, language) {
    const l = language
    
    const todayKey = l['CalParserTODAY']
    const tomorrowKey = l['CalParserTOMORROW']
    
    if (!language) throw 'Missing language object'
    const tod = mom()
    const sameDay = (mom1, mom2) => {
      return mom1.isSame(mom2, 'day')
    }
    
    let date = mom(str, 'Y-M-D', true)
    if (sameDay(tod, date)) return todayKey
    if (sameDay(mom().add(1, 'day'), date)) return tomorrowKey
    if (!tod.isSame(date, 'year')) return date.format('MMM Do, ddd, Y')
    if (!tod.isSame(date, 'month')) return date.format('MMM Do, ddd')
    return date.format('Do, ddd')
  },
  parseCalendarObjectToString(obj, language) {
    const l = language
    
    const everyDayKey = l['CalParserEveryDay']
    const daysKey = l['CalParserDaysKey']
    const everyKey = l['CalParserEveryKey']
    const DEFERKey = l['CalParserDEFER']
    const DUEKey = l['CalParserDUE']
    const timesKey = l['CalParserTimesKeyword']
    const perKey = l['CalParserPersistentKey']
    
    if (!language) throw 'Missing language object'
    let str = ''
    switch (obj.type) {
      case 'specific': {
        str += this.getHumanReadableDate(obj.specific, language)
        break
      }
      case 'periodic': {
        if (obj.periodic === 1)
          str = everyDayKey
        else str = `${everyKey} ${obj.periodic} ${daysKey}`
        break
      }
      case 'weekly': {
        str = `${everyKey} `
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
      str += `${DEFERKey} ` + this.getHumanReadableDate(obj.defer, language)
    }
    if (obj.due) {
      if (str !== '') str += ', '
      str += `${DUEKey} ` + this.getHumanReadableDate(obj.due, language)
    }
    if (obj.time) str += ` at ${obj.time}`
    const hasTimesBinding = obj.times !== null && obj.times !== undefined
    if (hasTimesBinding) str += ` ${obj.times} ${timesKey}`
    if (obj.persistent && hasTimesBinding) str += ' ' + perKey
    
    return str
  },
  download(filename, text) {
    let element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
    element.setAttribute('download', filename)
  
    element.style.display = 'none'
    document.body.appendChild(element)
  
    element.click()
  
    document.body.removeChild(element)
  }
}
