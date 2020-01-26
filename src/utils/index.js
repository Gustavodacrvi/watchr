
import mom from 'moment'
import utilsMoment from "./moment"
import utilsTask from "./task"
import firebase from 'firebase/app'

import Vue from 'vue'
import IconDrop from '@/components/IconDrop/IconDrop.vue'

let contextMenuRunned = false

import { mergeWith, isEqual } from 'lodash'

export default {
  addIdsToObjectFromKeys(obj) {
    for (const k in obj)
      if (obj.hasOwnProperty(k))
        obj[k] = {...obj[k], id: k}
  },
  updateVuexObject(state, arrName, source, changed, isFromHere) {
    const target = state[arrName]
    const targetKeys = Object.keys(target)
    const sourceKeys = Object.keys(source)

    for (const k of sourceKeys)
      if (!target[k])
        return Vue.set(state, arrName, {...source})
        
    for (const k of targetKeys)
      if (!source[k])
        return Vue.set(state, arrName, {...source})

    const changedKeys = !isFromHere || changed.length === 0 ? sourceKeys : changed

    console.time('ignore')
    changedKeys.forEach(k => {
      if (target[k])
        this.findChangesBetweenObjs(target[k], source[k],
          (key, val) => Vue.set(target[k], key, val)
        )
    })
    console.timeEnd('ignore')
  },
  findChangesBetweenObjs(oldObj, newObj, onFoundChange) {
    if (oldObj && newObj) {
      const keys = Object.keys(newObj)
      for (const k of keys) {
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
        
        if (change) onFoundChange(k, val)
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
  getHumanReadableDate(str, language) {
    const l = language
    
    if (!language) throw 'Missing language object'
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
  },
  parseTime(time, userInfo) {
    if (userInfo.disablePmFormat)
      return time
    return mom(time, 'H:m').format('h:m A')
  },
  parseCalendarObjectToString(obj, language, userInfo) {
    let str = ''

    const c = obj

    if (c.type === 'someday') return "Someday"

    switch (c.type) {
      case 'specific': {
        str += this.getHumanReadableDate(c.specific, language)
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
        str += `Every ${c.weekly.every} weeks on `
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

    if (c.time) str += ` at ${this.parseTime(c.time, userInfo)}`

    if (c.begins && c.begins !== c.editDate) {
      str += `, begins on ${this.getHumanReadableDate(c.begins, language)}`
    }

    if (c.ends) {
      if (c.ends.type === 'on date') {
        str += `, ends on ${this.getHumanReadableDate(c.ends.onDate, language)}`
      } else {
        str += `, ends after ${c.ends.times} times`
      }
    }

    return str
  },





  /*
    const l = language
    
    const everyDayKey = l['CalParserEveryDay']
    const daysKey = l['CalParserDaysKey']
    const everyKey = l['CalParserEveryKey']
    const DEFERKey = l['CalParserDEFER']
    const DUEKey = l['CalParserDUE']
    const timesKey = l['CalParserTimesKeyword']
    const perKey = l['CalParserPersistentKey']
    const somedayKey = l['CalParserSomeday']
    
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
      case 'someday': {
        str = `${somedayKey}`
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
    if (obj.time) str += ` at ${this.parseTime(obj.time, userInfo)}`
    const hasTimesBinding = obj.times !== null && obj.times !== undefined
    if (hasTimesBinding) str += ` ${obj.times} ${timesKey}`
    if (obj.persistent && hasTimesBinding) str += ' ' + perKey
    
    return str
  */
  
  
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
        if (old) document.body.removeChild(old)

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
        document.body.appendChild(vueEl)
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
    
/*             if (c.type === 'periodic' || c.type === 'weekly') {
      const lastComplete = mom(c.lastCompleteDate, 'Y-M-D')
      if (!moment.isValid()) moment = mom()
      return lastComplete.isSameOrAfter(moment, 'day')
    } */

    return false
  },
  saveByShortcut(vm, key, preventDefault, save) {
    const p = preventDefault
    const {isOnControl, isOnShift, isOnAlt} = vm

    switch (key) {
      case 'Delete': {
        save('delete')
        vm.$store.commit('clearSelected')
        break
      }
    }
    
    if (isOnShift) {
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
        case 'P': {
          save('save', {
            priority: 'High priority',
          })
          break
        }
        case 'M': {
          save('save', {
            priority: 'Medium priority',
          })
          break
        }
        case 'L': {
          save('save', {
            priority: 'Low priority',
          })
          break
        }
        case 'N': {
          save('save', {
            priority: '',
          })
          break
        }
      }
    }

    const iconDrop = opt => vm.$store.commit('pushIconDrop', opt)
          
    if (isOnAlt && !isOnControl)
    switch (key) {
      case '.': {
        save('toggleCompletion')
        break
      }
      case 'p': {
        save('pomo')
        break
      }
      case 's': {
        p()
        iconDrop({
          comp: 'CalendarPicker',
          repeat: true,
          content: {callback: calendar => save('save', {calendar})},
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
      case "l": {
        p()
        iconDrop({
          links: vm.lists.map(t => ({
            ...t,
            icon: 'tasks',
            callback: () => save('save', {
              list: t.id,
              folder: null,
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
