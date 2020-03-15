
import mom from 'moment'
import utilsMoment from "./moment"
import utilsTask from "./task"
import firebase from 'firebase/app'

import Vue from 'vue'
import IconDrop from '@/components/IconDrop/IconDrop.vue'

import LoadingComponent from '../components/Illustrations/LoadingComponent.vue'
import ErrorComponent from '../components/Illustrations/ErrorComponent.vue'

let contextMenuRunned = false

export default {
  getAutoSchedulerIconDropObject(autoSchedule, saveAutoSchedule, userInfo) {
    return {
      name: 'Auto schedule',
      icon: 'magic',
      callback: () => {
        if (autoSchedule)
          return [
            {
              name: 'Remove schedule',
              callback: () => saveAutoSchedule(null)
            },
            {
              name: 'Edit schedule',
              callback: () => this.getScheduleIconDropObject(autoSchedule, saveAutoSchedule, userInfo)
            }
          ]
        return this.getScheduleIconDropObject(null, saveAutoSchedule, userInfo)
      }
    }
  },
  getScheduleIconDropObject(info, saveAutoSchedule, userInfo) {
    if (!info)
      info = {time: mom().format('HH:mm'), buffer: '00:05', fallback: '00:15'}

    const {time, buffer, fallback} = info

    const formatTime = time => mom(time, 'HH:mm').format(userInfo.disablePmFormat ? 'HH:mm' : 'LT')

    return [
      {
        name: `${'Start from:'} <span class="fade">${formatTime(time)}</span>`,
        callback: () => ({
          comp: 'TimePicker',
          content: {
            msg: 'Start from:',
            callback: newTime => this.getScheduleIconDropObject({
              time: newTime, buffer, fallback,
            }, saveAutoSchedule, userInfo)
          }
        })
      },
      {
        name: `${'Buffer time:'} <span class="fade">${this.formatQuantity(buffer)}</span>`,
        callback: () => ({
          comp: 'TimePicker',
          content: {
            format: '24hr',
            msg: "Buffer time:",
            callback: newBuffer => this.getScheduleIconDropObject({
              time, buffer: newBuffer, fallback,
            }, saveAutoSchedule, userInfo)
          }
        })
      },
      {
        name: `${'Fallback time:'} <span class="fade">${this.formatQuantity(fallback)}</span>`,
        callback: () => ({
          comp: 'TimePicker',
          content: {
            format: '24hr',
            msg: "Buffer time:",
            callback: newFallback => this.getScheduleIconDropObject({
              time, buffer, fallback: newFallback,
            }, saveAutoSchedule, userInfo)
          }
        })
      },
      {
        name: 'Auto schedule',
        callback: () => {
          saveAutoSchedule({...info})
          return null
        },
        type: 'button',
      },
    ]
  },
  calendarObjNaturalCalendarInput(str, disablePmFormat) {
    const tod = mom()
    const TOD_STR = tod.format('Y-M-D')
    const format = disablePmFormat ? 'HH:mm' : 'LT'
    
    const matches = []
    let cal = null
    
    const get = obj => ({
      editDate: TOD_STR,
      begins: TOD_STR,
      ...obj,
    })
    const spec = str => get({
      type: 'specific',
      specific: str,
    })

    const setMonth = (num, calend) => {
      if (calend && calend.type === 'specific') {
        const time = mom(calend.specific, 'Y-M-D')
        time.month(num)
        return spec(time.format('Y-M-D'))
      }
    }

    const getWeekSpecific = week => spec(utilsMoment.nextWeekDay(tod, week, 'ddd', true).format('Y-M-D'))

    const specificMatches = [
      {
        match: ' next week',
        get: () => spec(tod.clone().add(1, 'week').startOf('week').add(1, 'd').format('Y-M-D'))
      },
      {
        match: ' next month',
        get: () => spec(tod.clone().add(1, 'month').startOf('month').format('Y-M-D')),
      },
      {
        match: ' next year',
        get: () => spec(tod.clone().add(1, 'year').startOf('year').format('Y-M-D')),
      },
      {
        match: ' in (\\d+) (\\w+)',
        get: (match, str) => {
          
          const split = str.split(' ')
          const num = parseInt(split[1], 10)
          const type = split[split.length - 1]

          const types = [
            'hours', 'days', 'weeks',
            'months', 'years',
          ]

          let calend
          if (num && type && types.includes(type)) {
            if (type !== 'hours') {
              calend = spec(tod.clone().add(num, type).format('Y-M-D'))
            } else {
              const mo = tod.clone().add(num, 'hours')
              calend = spec(mo.format('Y-M-D'))
              calend.time = mo.format('HH:mm')
            }
            matches.push(str)
            return calend
          }
          return null
        },
      },
      {
        match: '\\s([0-3][0-9])th',
        get: (match, str) => {
          const time = mom('' + parseInt(str, 10), 'D')

          let calend
          if (time.isValid()) {
            if (time.isAfter(tod, 'day'))
              calend = spec(time.format('Y-M-D'))
            else
              calend = spec(time.add(1, 'month').format('Y-M-D'))
            matches.push(str)
            return calend
          }
          return null
        },
      },
      {
        match: ' (january|jan)(?!(\\w+))',
        ignoreOtherMatches: true,
        get: (m, s, calend) => setMonth(0, calend),
      },
      {
        match: ' (february|feb)(?!(\\w+))',
        ignoreOtherMatches: true,
        get: (m, s, calend) => setMonth(1, calend),
      },
      {
        match: ' (march|mar)(?!(\\w+))',
        ignoreOtherMatches: true,
        get: (m, s, calend) => setMonth(2, calend),
      },
      {
        match: ' (april|apr)(?!(\\w+))',
        ignoreOtherMatches: true,
        get: (m, s, calend) => setMonth(3, calend),
      },
      {
        match: ' (may)(?!(\\w+))',
        ignoreOtherMatches: true,
        get: (m, s, calend) => setMonth(4, calend),
      },
      {
        match: ' (june|jun)(?!(\\w+))',
        ignoreOtherMatches: true,
        get: (m, s, calend) => setMonth(5, calend),
      },
      {
        match: ' (july|jul)(?!(\\w+))',
        ignoreOtherMatches: true,
        get: (m, s, calend) => setMonth(6, calend),
      },
      {
        match: ' (august|aug)(?!(\\w+))',
        ignoreOtherMatches: true,
        get: (m, s, calend) => setMonth(7, calend),
      },
      {
        match: ' (september|sep)(?!(\\w+))',
        ignoreOtherMatches: true,
        get: (m, s, calend) => setMonth(8, calend),
      },
      {
        match: ' (october|oct)(?!(\\w+))',
        ignoreOtherMatches: true,
        get: (m, s, calend) => setMonth(9, calend),
      },
      {
        match: ' (november|nov)(?!(\\w+))',
        ignoreOtherMatches: true,
        get: (m, s, calend) => setMonth(10, calend),
      },
      {
        match: ' (december|dec)(?!(\\w+))',
        ignoreOtherMatches: true,
        get: (m, s, calend) => setMonth(11, calend),
      },
      {
        match: ' ([0-9][0-9][0-9][0-9])',
        ignoreOtherMatches: true,
        get: (m, str, calend) => {
          if (calend && calend.type === 'specific') {
            let time = mom(str, 'Y')
            
            if (time.isValid()) {
              time = mom(calend.specific, 'Y-M-D')
              time.year(parseInt(str, 10))
              matches.push(str)
              return spec(time.format('Y-M-D'))
            }
          }
        },
      },

      {
        match: ' (sunday|sun)(?!(\\w+))',
        get: () => getWeekSpecific('Sun'),
      },
      {
        match: ' (monday|mon)(?!(\\w+))',
        get: () => getWeekSpecific('Mon'),
      },
      {
        match: ' (tuesday|tue)(?!(\\w+))',
        get: () => getWeekSpecific('Tue'),
      },
      {
        match: ' (wednesday|wed)(?!(\\w+))',
        get: () => getWeekSpecific('Wed'),
      },
      {
        match: ' (thursday|thu)(?!(\\w+))',
        get: () => getWeekSpecific('Thu'),
      },
      {
        match: ' (friday|fri)(?!(\\w+))',
        get: () => getWeekSpecific('Fri'),
      },
      {
        match: ' (saturday|sat)(?!(\\w+))',
        get: () => getWeekSpecific('Sat'),
      },

      {
        match: ' (today|tod)(?!(\\w+))',
        get: () => spec(TOD_STR),
      },
      {
        match: ' (tomorrow|tom|(next day))(?!(\\w+))',
        get: () => spec(tod.clone().add(1, 'd').format('Y-M-D')),
      },
    ]

    const getSpecificInputFromStr = str => {
      for (const el of specificMatches) {
        const match = str.match(new RegExp(el.match, 'gi'))
        if (match) {
          const first = (match[0] && match[0].trim()) || ''
          const obj = el.get(match, first)
          if (obj)
            return obj
        }
      }
    }

    let periodic = false
    let matchedSpecific = false
    
    const keywords = [
      {
        match: /\severy (\d+) days/gi,
        unshift: true,
        get: (m, str) => {
          const daily = parseInt(str.split(' ')[1], 10)
          if (daily) {
            periodic = true
            cal = {
              type: 'daily',
              daily,

              editDate: TOD_STR,
              begins: TOD_STR,
            }
          }
        },
      },
      {
        match: / every (\d+) days after/gi,
        unshift: true,
        get: (m, str) => {
          const daily = parseInt(str.split(' ')[1], 10)
          if (daily) {
            periodic = true
            cal = {
              type: 'after completion',
              afterCompletion: daily,

              editDate: TOD_STR,
              begins: TOD_STR,
            }
          }
        },
      },
      {
        match: /\severy (\d+) weeks( on)? ((Sunday|Sun|Monday|Mon|Tuesday|Tue|Wednesday|Wed|Thursday|Thu|Friday|Fri|Saturday|Sat),?(\s)?)+/gi,
        unshift: true,
        get: (m, str) => {
          const split = str.split(' ').filter(el => el)

          const weeks = parseInt(split[1], 10)

          split.splice(0, str.includes(' on') ? 4 : 3)

          const weekList = split.map(el => el.replace(',', '').slice(0, 2))

          if (weeks && weekList) {
            periodic = true
            cal = {
              type: 'weekly',
              weekly: {
                every: weeks,
                days: weekList.map(w => parseInt(mom(w, 'ddd').format('e'), 10)),
              },
              
              editDate: TOD_STR,
              begins: TOD_STR,   
            }
          }
        }
      },
      {
        match: /\severy (\d+) months( on)?( the)? (last|[1-7])(st|nd|rd|th)? (day|Sunday|Sun|Monday|Mon|Tuesday|Tue|Wednesday|Wed|Thursday|Thu|Friday|Fri|Saturday|Sat)/gi,
        unshift: true,
        get: (m, str) => {
          const split = str.split(' ').filter(el => el)
          
          const months = parseInt(split[1], 10)

          let weekDayPos = 3

          if (str.includes(' on'))
            weekDayPos++
          if (str.includes(' the'))
            weekDayPos++

          const monthDay = split[weekDayPos]
          const weekDay = split[weekDayPos + 1]

          const isPossibleWeekdayOverflow = (weekDay !== 'day' && (monthDay > 3))

          if (months && monthDay && weekDay && !isPossibleWeekdayOverflow) {
            periodic = true
            cal = {
              type: 'monthly',
              monthly: {
                every: months,
                place: monthDay,
                type: weekDay === 'day' ? 'day' : parseInt(mom(weekDay.slice(0, 2), 'ddd').format('e'), 10),
              },
              
              editDate: TOD_STR,
              begins: TOD_STR,   
            }
          }
        },
      },
      {
        match: /\severy (\d+) years( on)? ((January|Jan|February|Feb|March|Mar|April|Apr|May|June|Jun|July|Jul|August|Aug|September|Sep|October|Oct|November|Nov|December|Dec),?(\s)?)+( on)?( the)? (last|[1-7])(st|nd|rd|th)? (day|Sunday|Sun|Monday|Mon|Tuesday|Tue|Wednesday|Wed|Thursday|Thu|Friday|Fri|Saturday|Sat)/gi,
        unshift: true,
        get: (m, str) => {
          const split = str.split(' ').filter(el => el)
          
          const years = parseInt(split[1], 10)

          split.splice(0, split[3] === 'on' ? 4 : 3)

          const months = []
          for (const m of split) {
            if (
              m === 'on' || m === 'the' || m === 'last' ||
              (parseInt(m, 10) > 0 && parseInt(m, 10) < 8)
              )
              break
            else months.push(m.replace(',', '').replace(' ', ''))
          }

          split.splice(0, months.length)

          let i = split.findIndex(el => el === 'on')
          if (i > -1)
            split.splice(i, 1)

          i = split.findIndex(el => el === 'the')
          if (i > -1)
            split.splice(i, 1)

          const monthDay = split[0]

          split.splice(0, 1)

          const weekDay = split[0]

          if (years && months && months.length > 0 && monthDay && weekDay) {
            periodic = true
            cal = {
              editDate: TOD_STR,
              begins: TOD_STR,

              type: 'yearly',
              yearly: {
                every: years,
                months: months.map(w => parseInt(mom(w, 'MMM').format('M'), 10)),
                place: monthDay,
                type: weekDay === 'day' ? 'day' : parseInt(mom(weekDay.slice(0, 2), 'ddd').format('e'), 10),
              }
            }
          }
        },
      },
      {
        match: / (ends|defer)( on)? (.*)/gi,
        get: (m, str) => {
          if (periodic && cal) {
            const obj = getSpecificInputFromStr(str)
            if (obj && obj.specific) {
              cal.ends = {
                type: 'on date',
                onDate: obj.specific,
              }
            }
          }
        },
      },
      {
        match: / (\d+) times/gi,
        get: (m, str) => {
          if (periodic && cal) {
            const days = parseInt(str.split(' ')[0], 10)
            if (days)
              cal.ends = {
                type: 'times',
                times: days,
              }
          }
        },
      },
      {
        match: / (begins|due)( on)? (.*)/gi,
        get: (m, str) => {
          if (periodic && cal) {
            const obj = getSpecificInputFromStr(str)
            if (obj && obj.specific) {
              cal.begins = obj.specific
            }
          }
        },
      },
      ...(specificMatches.map(el => ({
            match: new RegExp(el.match, 'gi'),
            get: (m, s) => {
              if (!periodic && (!matchedSpecific || el.ignoreOtherMatches)) {
                cal = el.get(m, s, cal)
                matchedSpecific = true
              }
            }
          }))
        ),
      {
        match: / (someday|som)(?!(\w+))/gi,
        get: () => cal = get({type: 'someday'})
      },
      {
        match: !disablePmFormat ? /\s(at )?(([2-9]|1[0-2]?)|(1[0-2]|0?[1-9]):([0-5][0-9]))(pm|am)/gi : /\s(at )?(2[0-3]|[01]?[0-9]):([0-5]?[0-9])/gi, // match 1am - 12am, 1pm - 12pm
        get: (match, str) => {
          const time = mom(str, format)
          if (time.isValid()) {
            const hour = time.format('HH:mm')
            matches.push(str)
            if (cal) {
              cal.time = hour
            } else {
              if (time.isSameOrBefore(tod, 'minute')) {
                cal = spec(tod.clone().add(1, 'd').format('Y-M-D'))
                cal.time = hour
              } else {
                cal = spec(TOD_STR)
                cal.time = hour
              }
            }
          }
        },
      },
      {
        match: / (evening|eve)(?!(\w+))/gi,
        get: () => {
          if (cal) {
            cal.evening = true
            return cal 
          }
        }
      },
      {
        match: / (no date)(?!(\w+))/gi,
        get: () => cal = null,
      },
    ]
    
    for (const obj of keywords) {
      const match = str.match(obj.match)
      if (match) {
        const first = (match[0] && match[0].trim()) || ''
        if (!obj.unshift)
          matches.push(first)
        else
          matches.unshift(first)
        obj.get(match, first)
      }
    }

    return {calendar: cal, matches}
  },
  parseHTMLStr(str) {
    const escapeHTML = str => {
      let div = document.createElement("div")
      div.innerHTML = str
      return div.textContent || div.innerText || ""
    }
    
    return escapeHTML(str)
          .replace(/\[(https?:\/\/[^\]\s]+)(?: ([^\]]*))?\]/gi, "<a class='parsed-link' target='_blank' oncontextmenu='event.stopPropagation()' onclick='event.stopPropagation()' href='$1'>$2</a>")
          .replace(/__(.*?)__/gi, "<b>$1</b>")
          .replace(/\*(.*?)\*/gi, "<i>$1</i>")
          .replace(/\{(.*?)(?: ([^\}]*))?\}/gi, "<span style='color: $1'>$2</span>")
  },
  asyncComp(comp, allowComp = true) {
    return () => ({
      component: comp,
      loading: allowComp ? LoadingComponent : undefined,
      error: allowComp ? ErrorComponent : undefined,
      delay: 300,
      timeout: 75000,
    })
  },
  addIdsToObjectFromKeys(obj) {
    if (obj)
      for (const k in obj)
        if (obj.hasOwnProperty(k) && obj[k])
          obj[k] = {...obj[k], id: k}
    return obj
  },
  getUserProfileData(user) {
    return {
      displayName: user.displayName,
      email: user.email,
      uid: user.uid || user.userId,
      photoURL: user.photoURL,
    }
  },
  updateVuexObject(state, objName, source, filter) {
    const target = state[objName]
    const targetKeys = Object.keys(target)
    const sourceKeys = Object.keys(source)

    this.addIdsToObjectFromKeys(source)

    for (const k of sourceKeys)
      if (!target[k])
        return Vue.set(state, objName, {...source})
        
    for (const k of targetKeys)
      if (!source[k])
        return Vue.set(state, objName, {...source})

    sourceKeys.forEach(k => {
      if (target[k] && (!filter || filter(target[k])))
        this.findChangesBetweenObjs(target[k], source[k],
          (key, val) => Vue.set(target[k], key, val)
        )
    })
  },
  findChangesBetweenObjs(oldObj, newObj, onFoundChange, ignoreKeys) {
    if (oldObj && newObj) {
      const keys = Object.keys(newObj)
      for (const k of keys) {
        if (ignoreKeys && ignoreKeys.includes(k))
          continue
        const old = oldObj[k]
        const val = newObj[k]
        const type = typeof val
        let change = false

        switch (type) {
          case 'object': {
            change = JSON.stringify(val) !== JSON.stringify(old)
            break
          }
          default: {
            change = old !== val
          }
        }
        
        if (change) {
          if (onFoundChange)
            onFoundChange(k, val)
          else
            Vue.set(oldObj, k, val)
        }
      }
    }
  },
  getDataFromFirestoreSnapshot(state, changes, arrName) {
    changes.forEach(change => {
      const newDoc = {...change.doc.data(), id: change.doc.id}

      if (change.type === 'added') {
        const el = state[arrName].find(el => el.id === change.doc.id)
        if (!el)
          state[arrName].push(newDoc)
      } else if (change.type === 'removed') {
        const index = state[arrName].findIndex(el => el.id === change.doc.id)
        state[arrName].splice(index, 1)
      } else {
        const i = state[arrName].findIndex(el => el.id === change.doc.id)
        
        this.findChangesBetweenObjs(state[arrName][i], newDoc, (key, val) => Vue.set(state[arrName][i], key, val))
      }
    })
  },
  getUid() {
    return firebase.firestore().collection('tasks').doc().id
  },
  parseMomentToObject(m) {
    return {
      day: m.format('D'),
      month: m.format('MMM').toLowerCase(),
      year: m.format('Y'),
    }
  },
  transitionColor(oldNum, newNum, offset, max) {
    return (newNum * offset / max) + oldNum - (oldNum * offset / max)
  },
  getHumanReadableDate(str) {
    const tod = mom()
    const sameDay = (mom1, mom2) => {
      return mom1.isSame(mom2, 'day')
    }
    
    let date = mom(str, 'Y-M-D')
    if (sameDay(tod, date)) return 'Today'
    if (sameDay(mom().add(1, 'day'), date)) return 'Tomorrow'
    if (!tod.isSame(date, 'year')) return date.format('MMM Do, ddd, Y')
    if (!tod.isSame(date, 'month')) return date.format('MMM Do, ddd')
    return date.format('Do, ddd')
  },
  parseTime(time, userInfo) {
    if (userInfo.disablePmFormat)
      return time
    return mom(time, 'H:m').format('h:m A')
  },
  parseCalendarObjectToString(obj, userInfo, forceShowInfo = false, allowHours = true) {
    let str = ''

    const c = obj

    if (c.type === 'someday') return "Someday"

    switch (c.type) {
      case 'specific': {
        const date = this.getHumanReadableDate(c.specific)
        if (forceShowInfo || date !== 'Today')
          str += date
        break
      }
      case 'after completion': {
        str += `${c.afterCompletion} days after`
        break
      }
      case 'daily': {
        str += `Every ${c.daily} days`
        break
      }
      case 'weekly': {
        if (c.weekly.every > 1)
          str += `Every ${c.weekly.every} weeks on `
        else str += 'Every '
        let i = 0
        for (const w of c.weekly.days) {
          str += mom(w, 'e').format('ddd')

          if ((i + 1) !== c.weekly.days.length)
            str += ', '
          i++
        }
        break
      }
      case 'monthly': {
        str += `Every ${c.monthly.every} months on the ${c.monthly.place} ${c.monthly.type === 'day' ? c.monthly.type : mom(c.monthly.type, 'e').format('ddd')}`
        break
      }
      case 'yearly': {
        str += `Every ${c.yearly.every} years on the ${c.yearly.place} ${c.yearly.type === 'day' ? c.yearly.type : mom(c.yearly.type, 'e').format('ddd')} of `
        let i = 0
        for (const w of c.yearly.months) {
          str += mom(w, 'M').format('MMM')

          if ((i + 1) !== c.yearly.months.length)
            str += ', '
          i++
        }
        break
      }
    }

    if (c.time && allowHours) str += ` at ${this.parseTime(c.time, userInfo)}`

    if (c.begins && c.begins !== c.editDate && (forceShowInfo || mom(c.begins, 'Y-M-D').isSameOrAfter(mom(), 'day'))) {
      str += `, begins on ${this.getHumanReadableDate(c.begins)}`
    }

    if (c.ends) {
      if (c.ends.type === 'on date') {
        str += `, ends on ${this.getHumanReadableDate(c.ends.onDate)}`
      } else {
        str += `, ends after ${c.ends.times} times`
      }
    }

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
  },
  downloadBlobFromURL(url, getProgress) {
    return new Promise((solve, reject) => {
      const xhr = new XMLHttpRequest()
      if (getProgress)
        xhr.onprogress = getProgress
      xhr.responseType = 'blob'
      xhr.onload = () => solve(xhr.response)
      xhr.onerror = () => reject()
      xhr.open('GET', url)
      xhr.send()
    })
  },
  exportListTemplate({list, tasks}) {
    const ts = []
    for (const t of tasks) ts.push({...t,
      userId: undefined,
      completeDate: null,
      completed: false,
    })
    
    const template = {
      list: {...list, userId: null, options: undefined},
      tasks: ts,
    }

    this.download(list.name + '.json', JSON.stringify(template))
  },
  bindOptionsToEventListener(node, options, parent, event, translateY) {
    node.addEventListener(event ? event : 'contextmenu', evt => {
      evt.preventDefault()
      if (!contextMenuRunned) {
        const y = evt.pageY + 'px'
        const x = evt.pageX + 'px'
        const old = document.getElementById('contextmenu')
        const body = document.getElementById('app')
        if (old) body.removeChild(old)

        const Constructor = Vue.extend(IconDrop)
        const ins = new Constructor({
          parent,
          propsData: {
            options, defaultShowing: true, id: 'contextmenu',
            root: true, hideHandle: true,
          }
        })
        const vueEl = document.createElement('div')
        vueEl.setAttribute('id', 'click-contextmenu')
        body.appendChild(vueEl)
        ins.$mount('#click-contextmenu')

        const drop = document.getElementById('contextmenu')
        const s = drop.style
        s.position = 'absolute'
        s.left = x
        s.top = y
        if (translateY)
          s.transform = `translateY(${translateY})`
        
        setTimeout(() => contextMenuRunned = false)
      }
    })
  },
  getRelevantUserData(userAuth) {
    if (!userAuth.email)
      return {
        userId: userAuth,
        isAnonymous: true,
      }
    let obj = {
      userId: userAuth.uid,
      email: userAuth.email,
      photoURL: userAuth.photoURL,
      displayName: userAuth.displayName,
      isAnonymous: false,
    }
    return obj
  },
  formatQuantity(time) {
    const split = mom(time, 'HH:mm').format('H:m').split(':')

    const hours = split[0] + 'h'
    const minutes = split[1] + 'm'

    if (split[0] === '0' && split[1] === '0')
      return '0m'
    if (split[0] === '0')
      return minutes
    if (split[1] === '0')
      return hours
    return `${hours} ${minutes}`
  },
  isItemCompleted(item, moment) {
    const c = item.calendar
    if (!c || c.type === 'someday' || c.type === 'specific') return item.completed
    
    let tod = mom(moment, 'Y-M-D')
    if (!tod.isValid()) tod = mom()
    if (c.type === 'after completion') {
      if (!c.lastCompleteDate) return false
      const last = mom(c.lastCompleteDate, 'Y-M-D')
      const dayDiff = tod.diff(last, 'days')
      return dayDiff < c.afterCompletion
    }
    if (c.type === 'daily') {
      const lastComplete = mom(c.lastCompleteDate, 'Y-M-D')
      const diff = tod.diff(lastComplete, 'days')
      return lastComplete.isSameOrAfter(tod, 'day') ||
              diff < c.daily
    }

    if (c.type === 'weekly' || c.type === 'monthly' || c.type === 'yearly' || c.type === 'yearly') {
      return mom(c.lastCompleteDate, 'Y-M-D').isSameOrAfter(tod, 'day')
    }
    
    return false
  },
  saveByShortcut(vm, isEditing, key, preventDefault, save, specificMessage = []) {
    const p = preventDefault
    const {isOnControl, isOnShift, isOnAlt} = vm

    if (!isEditing)
      switch (key) {
        case 'Delete': {
          save('delete')
          vm.$store.commit('clearSelected')
          break
        }
        case '.': {
          save('toggleCompletion')
          break
        }
        case ',': {
          save('toggleCancel')
          break
        }
      }
    
    if (isOnShift && !isEditing) {
      switch (key) {
        case 'S': {
          save('save', {
            calendar: {
              type: 'someday'
            }
          })
          break
        }
        case 'T': {
          const TOD_STR = mom().format('Y-M-D')
          save('save', {
            calendar: {
              type: 'specific',
              editDate: TOD_STR,
              begins: TOD_STR,
        
              specific: TOD_STR,
            }
          })
          break
        }
      }
    }

    const iconDrop = opt => vm.$store.commit('pushIconDrop', opt)

    if (isOnShift && isOnAlt)
      switch (key) {
        case 'L': {
          save('logbook')
          break
        }
        case "A": {
          save('assign')
          break
        }
      }
          
    if (isOnAlt && !isOnControl)
      switch (key) {
        case 's': {
          p()
          iconDrop({
            comp: 'CalendarPicker',
            repeat: true,
            content: {
              repeat: true,
              callback: calendar => {
                if (specificMessage.includes('CalendarPicker'))
                  save('CalendarPicker', calendar)
                else
                  save('save', {calendar})
              }
            }
          })
          break
        }
        case 'd': {
          p()
          iconDrop({
            comp: 'CalendarPicker',
            repeat: true,
            content: {
              onlyDates: true,
              noTime: true,
              allowNull: true,
              callback: ({specific}) => save('save', {deadline: specific})
            },
          })
          break
        }
        case 'h': {
          save('save', {
            priority: 'High priority',
          })
          break
        }
        case 'm': {
          save('save', {
            priority: 'Medium priority',
          })
          break
        }
        case 'l': {
          save('save', {
            priority: 'Low priority',
          })
          break
        }
        case 'n': {
          save('save', {
            priority: '',
          })
          break
        }
        case "t": {
          p()
          iconDrop({
            links: (vm.tags || []).map(t => ({...t, icon: 'tag'})),
            select: true,
            onSave: names => save('save', {
              tags: (vm.tags || []).filter(t => names.includes(t.name)).map(el => el.id),
            }),
            selected: [],
            allowSearch: true,
          })
          break
        }
        case "k": {
          p()
          iconDrop({
            links: vm.lists.map(t => ({
              ...t,
              icon: 'tasks',
              callback: () => save('save', {
                list: t.id,
                folder: null,
                group: null,
                heading: null,
              }),
            })),
            allowSearch: true,
          })
          break
        }
        case "f": {
          p()
          iconDrop({
            links: vm.folders.map(t => ({
              ...t,
              icon: 'tasks',
              callback: () => save('save', {
                folder: t.id,
                list: null,
                group: null,
                heading: null,
              }),
            })),
            allowSearch: true,
          })
          break
        }
        case 'g': {
          p()
          iconDrop({
            links: vm.groups.map(t => ({
              ...t,
              icon: 'group',
              callback: () => save('save', {
                folder: null,
                list: null,
                group: t.id,
                heading: null,
              }),
            })),
            allowSearch: true,
          })
          break
        }
      }

  },
}
