
import LoadingComponent from '@/components/LoadingComponent.vue'
import ErrorComponent from '@/components/ErrorComponent.vue'

import { Task, TaskInputObj, Perspective, PeriodicObject } from '@/interfaces/app'

import timezone from 'moment-timezone'
import { SetState } from '@/interfaces/store/settings'

export default {
  fixStoreChanges(state: any, changes: any, arrName: string) {
    for (const change of changes)
      if (change.type === 'added') {
        const lab = state[arrName].find((el: any) => el.id === change.doc.id)
        if (!lab)
          state[arrName].push({...change.doc.data(), id: change.doc.id} as any)
      } else if (change.type === 'removed') {
        const index = state[arrName].findIndex((el: any) => el.id === change.doc.id)
        state[arrName].splice(index, 1)
      } else {
        const index = state[arrName].findIndex((el: any) => el.id === change.doc.id)
        state[arrName].splice(index, 1, {...change.doc.data(), id: change.doc.id} as any)
      }
  },
  AsyncComponent(comp: any): any {
    return () => ({
      component: comp,
      loading: LoadingComponent,
      error: ErrorComponent,
      delay: 200,
      timeout: 5000,
    })
  },
  getMomentsOutOfTask(date: string, timeZone: string, time?: string | null): {today: any, saved: any} {
    const today = timezone().tz(timeZone)
    let saved!: any
    if (!time)
      saved = timezone.tz(`${date}`, 'Y-M-D', timeZone)
    else saved = timezone.tz(`${date} ${time}`, 'Y-M-D HH:mm', 'UTC').tz(timeZone)
    return {saved, today}
  },
  removeClonedItems(arr: any[]) {
    const set = new Set()
    const finalArr = []
    for (const item of arr)
      if (!set.has(item)) {
        finalArr.push(item)
        set.add(item)
      }
    return finalArr
  },
  filterTasksBySmartPerspective(name: string, tasks: Task[], timeZone: string, startOfTheWeek: string): Task[] {
    const weekFilter = (els: Task[], week: string): Task[] => {
      return tasks.filter(el => {
        if (el.date) {
          const {saved} = this.getMomentsOutOfTask(el.date, timeZone)
          return saved.format('dddd') === week
        }
        return false
      })
    }
    switch (name) {
      case 'Inbox': {
        return tasks.filter(el => el.labels.length === 0 && !el.date && el.projectId === '' && !el.periodic)
      }
      case 'Have tags': return tasks.filter(el => el.labels.length > 0)
      case `Doesn't have tags`: return tasks.filter(el => el.labels.length === 0)
      case 'Today': {
        return tasks.filter(t => {
          if (t.date || t.periodic) {
            const date = t.date as string
            if (!t.periodic) {
              const {today, saved} = this.getMomentsOutOfTask(date, timeZone)
              return today.isSame(saved, 'day')
            } else if (t.periodic && t.type === 'interval') {
              const today = timezone()
              const first = timezone(t.firstPeriodicDay, 'Y-M-D')
              const diff = today.diff(first, 'days')
              return diff % t.periodicInterval === 0 && t.times !== 0
            } else if (t.periodic && t.type === 'weekdays') {
              if (t.weekDays === null) return true && t.times !== 0
              else return t.weekDays.includes(timezone().format('dddd'))
            }
          }
          return false
        })
      }
      case 'Next week': {
        return tasks.filter(el => {
          if (el.date) {
            const {today, saved} = this.getMomentsOutOfTask(el.date, timeZone)
            const start = this.getNextWeek(today.clone(), startOfTheWeek)
            const end = start.clone().add(6, 'd')
            return start.isSameOrBefore(saved, 'day') && end.isSameOrAfter(saved, 'day')
          }
          return false
        })
      }
      case 'This week': {
        return tasks.filter(el => {
          if (el.date) {
            const {today, saved} = this.getMomentsOutOfTask(el.date, timeZone)
            const start = this.getNextWeek(today.clone(), startOfTheWeek).subtract(6, 'd')
            const end = start.clone().add(6, 'd')
            return start.isSameOrBefore(saved, 'day') && end.isSameOrAfter(saved, 'day')
          }
          return false
        })
      }
      case 'Next month': {
        return tasks.filter(el => {
          if (el.date) {
            const nextMonth = timezone().add(1, 'M').tz(timeZone)
            const {saved} = this.getMomentsOutOfTask(el.date, timeZone)
            const start = nextMonth.clone().startOf('month')
            const end = nextMonth.clone().endOf('month')

            return start.isSameOrBefore(saved, 'day') && end.isSameOrAfter(saved, 'day')
          }
          return false
        })
      }
      case 'Tomorrow': {
        return tasks.filter(t => {
          if (t.date || t.periodic) {
            const date = t.date as string
            if (!t.periodic) {
              const {today, saved} = this.getMomentsOutOfTask(date, timeZone)
              return today.clone().add(1, 'day').isSame(saved, 'day')
            } else if (t.periodic && t.type === 'interval') {
              const tomorrow = timezone().add(1, 'day')
              const first = timezone(t.firstPeriodicDay, 'Y-M-D')
              const diff = tomorrow.diff(first, 'days')
              return diff % t.periodicInterval === 0 && t.times !== 0
            } else if (t.periodic && t.type === 'weekdays') {
              if (t.weekDays === null) return true
              else return t.weekDays.includes(timezone().add(1, 'day').format('dddd'))
            }
          }
          return false
        })
      }
      case 'Completed': {
        return tasks.filter(el => el.completed)
      }
      case 'Has project': {
        return tasks.filter(el => el.projectId)
      }
      case `Doesn't have project`: {
        return tasks.filter(el => !el.projectId)
      }
      case 'Overdue': {
        return tasks.filter(t => {
          if (t.date || t.periodic) {
            const date = t.date as string
            if (!t.periodic) {
              const {today, saved} = this.getMomentsOutOfTask(date, timeZone)
              return saved.isBefore(today, 'day') && !t.completed
            } else if (t.periodic && t.type === 'interval') {
              const today = timezone()
              const first = timezone(t.firstPeriodicDay, 'Y-M-D')
              const lastEvent = first.clone()
              const diff = today.diff(first, 'days')
              const timesToAdd = Math.floor(diff / t.periodicInterval)
              lastEvent.add(t.periodicInterval * timesToAdd, 'd')
              const lastCompleted = timezone(t.completedDate, 'Y-M-D')
              if (!lastCompleted.isValid()) return lastEvent.isBefore(today, 'day')
              else return lastCompleted.isBefore(lastEvent, 'day')
            } else if (t.periodic && t.type === 'weekdays') {
              if (t.weekDays === null) {
                const today = timezone()
                const yesterday = today.clone().subtract(1, 'day')
                const lastCompleted = timezone(t.completedDate, 'Y-M-D')
                const firstPeriodicDay = timezone(t.firstPeriodicDay, 'Y-M-D')
                if (!lastCompleted.isValid()) return today.diff(firstPeriodicDay, 'days') > 1
                return lastCompleted.isBefore(yesterday, 'day')
              }
              else {
                const lastEvent = this.getLastWeekDay(timezone(), t.weekDays)
                const lastCompleted = timezone(t.completedDate, 'Y-M-D')
                const firstPeriodicDay = timezone(t.firstPeriodicDay, 'Y-M-D')
                if (!lastCompleted.isValid()) return lastEvent.isBefore(timezone(), 'day') && lastEvent.isSameOrAfter(firstPeriodicDay, 'day')
                else return lastCompleted.isBefore(lastEvent, 'day')
              }
            }
          }
          return false
        })
      }
      case 'Upcoming': {
        return tasks.filter(el => {
          if (el.date) {
            const {today, saved} = this.getMomentsOutOfTask(el.date, timeZone)
            return saved.isAfter(today, 'day')
          }
          return false
        })
      }
      case 'Sunday': {
        return weekFilter(tasks, 'Sunday')
      }
      case 'Monday': {
        return weekFilter(tasks, 'Monday')
      }
      case 'Tuesday': {
        return weekFilter(tasks, 'Tuesday')
      }
      case 'Wednesday': {
        return weekFilter(tasks, 'Wednesday')
      }
      case 'Thursday': {
        return weekFilter(tasks, 'Thursday')
      }
      case 'Friday': {
        return weekFilter(tasks, 'Friday')
      }
    }
    return tasks
  },
  filterTasksByPerspective(per: Perspective, tasks: Task[], timeZone: string, startOfTheWeek: string): Task[] {
    if (!per.isSmart) {
      const pers = per as Perspective
      if (pers.priority)
        tasks = this.filterTasksByPriority(tasks, pers.priority)
      if (pers.includeAndLabels.length > 0)
        tasks = this.filterTasksByLabels(tasks, pers.includeAndLabels)
      if (pers.includeAndSmartPers)
        for (const smart of pers.includeAndSmartPers)
          tasks = this.filterTasksBySmartPerspective(smart, tasks, timeZone, startOfTheWeek)
      return tasks
    }
    return this.filterTasksBySmartPerspective(per.name, tasks, timeZone, startOfTheWeek)
  },
  snakeToCamel(s: string) {
    return s.replace(/(\-\w)/g, (m: any) => m[1].toUpperCase())
  },
  sortArrayByIds(arr: Array<{id: string, [key: string]: any}>, order: string[]): any[] {
    const sorted: any[] = []
    for (const id of order) {
      const lab: any | undefined = arr.find(el => el.id === id)
      if (lab)
        sorted.push(lab)
    }
    return this.removeClonedItems(sorted)
  },
  arraysEqual(arr1: any[], arr2: any[]): boolean {
    if (arr1.length !== arr2.length)
      return false
    for (let i = arr1.length; i--;)
      if (arr1[i] !== arr2[i])
        return false
    return true
  },
  // tslint:disable-next-line:max-line-length
  fixOrder(arrOfObjects: Array<{id: string, [key: string]: any}>, orderOfObjects: string[], notIncludeMissingIds: boolean = false) {
    const arr = arrOfObjects.slice()
    const order = orderOfObjects.slice()
    if (!notIncludeMissingIds)
      for (const el of arr)
        if (!order.includes(el.id))
          order.push(el.id)
    const idsToRemove: string[] = []
    for (const id of order) {
      const task = arr.find(el => el.id === id)
      if (!task)
        idsToRemove.push(id)
    }
    for (const id of idsToRemove) {
      const index = order.indexOf(id)
      order.splice(index, 1)
    }
    return order
  },
  parseMomentTimeZone(str: string): string {
    return str.replace('/', ', ').replace('_', ' ')
  },
  deParseMomentTimeZone(str: string): string {
    return str.replace(', ', '/').replace(' ', '_')
  },
  filterTasksByLabels(tasks: Task[], labels: string[]): Task[] {
    for (const id of labels)
      tasks = tasks.filter(el => el.labels.includes(id))
    return tasks
  },
  filterTasksByDates(tasks: Task[], dates: string[], timeZone: string): Task[] {
    const filters: any[] = []
    for (const d of dates)
      filters.push(timezone.tz(d, 'Y-M-D', timeZone))
    tasks = tasks.filter(el => el.date)
    for (const f of filters)
      tasks = tasks.filter(el => {
        const saved = timezone.tz(`${el.date} ${timezone.utc().format('HH:mm')}`, 'Y-M-D HH:mm', 'UTC').tz(timeZone)
        return f.isSame(saved, 'day')
      })
    return tasks
  },
  filterTasksByPriority(tasks: Task[], priority: string): Task[] {
    if (priority && priority !== 'No priority')
      return tasks.filter(el => el.priority === priority)
    else if (priority && priority === 'No priority')
      return tasks.filter(el => el.priority === '')
    return tasks
  },
  sortTasksByMultipleCriteria(tasks: Task[], sort: string[]): Task[] {
    const dateNewest = (t1: Task, t2: Task, newest: boolean): number => {
      let num = 1
      if (!newest) num = -1
      if (!t1.date && t2.date) return num
      if (t1.date && !t2.date) return -num
      if (!t1.date && !t2.date) return 0

      const t1HasTimet2Doesnt = t1.time && !t2.time
      const t2HasTimet1Doesnt = !t1.time && t2.time
      const neitherOfThemHasTime = !t1.time && !t2.time
      const bothOfThemHaveTime = t1.time && t2.time

      const noTime1 = timezone.tz(`${t1.date}`, 'Y-M-D', 'UTC')
      const hasTime1 = timezone.tz(`${t1.date} ${t1.time}`, 'Y-M-D HH:mm', 'UTC')
      const noTime2 = timezone.tz(`${t2.date}`, 'Y-M-D', 'UTC')
      const hasTime2 = timezone.tz(`${t2.date} ${t2.time}`, 'Y-M-D HH:mm', 'UTC')

      const areTheSameDay = noTime1.isSame(noTime2, 'day')
      const t1ComesBeforet2Day = noTime1.isBefore(noTime2, 'day')
      const t1ComesAftert2Day = noTime1.isAfter(noTime2, 'day')

      if (areTheSameDay) {
        if (t1HasTimet2Doesnt) return num
        if (t2HasTimet1Doesnt) return -num
        if (neitherOfThemHasTime) return 0
        if (bothOfThemHaveTime) {
          if (hasTime1.isSame(hasTime2, 'minute')) return 0
          if (hasTime1.isAfter(hasTime2, 'minute')) return num
          if (hasTime1.isBefore(hasTime2, 'minute')) return -num
        }
      }
      if (t1ComesBeforet2Day) return -num
      if (t1ComesAftert2Day) return num

      return 0
    }
    const lastEditDateNewest = (t1: Task, t2: Task, newest: boolean): number => {
      let num = 1
      if (!newest) num = -1
      const mom1 = timezone.tz(`${t1.lastEditDate}`, 'Y-M-D HH:mm', 'UTC')
      const mom2 = timezone.tz(`${t2.lastEditDate}`, 'Y-M-D HH:mm', 'UTC')
      if (mom1.isSame(mom2, 'minute')) return 0
      if (mom1.isAfter(mom2, 'minute')) return -num
      if (mom1.isBefore(mom2, 'minute')) return num
      return 0
    }
    const creationDateNewest = (t1: Task, t2: Task, newest: boolean): number => {
      let num = 1
      if (!newest) num = -1
      const mom1 = timezone.tz(`${t1.creationDate}`, 'Y-M-D HH:mm', 'UTC')
      const mom2 = timezone.tz(`${t2.creationDate}`, 'Y-M-D HH:mm', 'UTC')
      if (mom1.isSame(mom2, 'minute')) return 0
      if (mom1.isBefore(mom2, 'minute')) return num
      if (mom1.isAfter(mom2, 'minute')) return -num
      return 0
    }
    const priorityHighest = (t1: Task, t2: Task, highest: boolean): number => {
      let num = 1
      if (!highest) num = -1
      const priA = t1.priority
      const priB = t2.priority
      switch (priA) {
        case 'Low priority':
          switch (priB) {
            case 'Low priority': return 0
            case 'Medium priority': return num
            case 'High priority': return num
            default: return -1
          }
        case 'Medium priority':
          switch (priB) {
            case 'Medium priority': return 0
            case 'High priority': return num
            case 'Low priority': return -num
            default: return -1
          }
        case 'High priority':
          switch (priB) {
            case 'High priority': return 0
            case 'Low priority': return -num
            case 'Medium priority': return -num
            default: return -1
          }
      }
      return 0
    }

    const obj: {[key: string]: (task1: Task, task2: Task) => number} = {
      name: (task1: Task, task2: Task) => {
        return task1.name.localeCompare(task2.name)
      },
      nameReversed: (task1: Task, task2: Task) => {
        return task2.name.localeCompare(task1.name)
      },
      priorityHighest: (task1: Task, task2: Task) => {
        return priorityHighest(task1, task2, true)
      },
      priorityLowest: (task1: Task, task2: Task) => {
        return priorityHighest(task1, task2, false)
      },
      creationDateNewest: (t1: Task, t2: Task) => {
        return creationDateNewest(t1, t2, true)
      },
      creationDateOldest: (t1: Task, t2: Task) => {
        return creationDateNewest(t1, t2, false)
      },
      lastEditDateNewest: (t1: Task, t2: Task) => {
        return lastEditDateNewest(t1, t2, true)
      },
      lastEditDateOldest: (t1: Task, t2: Task) => {
        return lastEditDateNewest(t1, t2, false)
      },
      dateNewest: (t1: Task, t2: Task) => {
        return dateNewest(t1, t2, true)
      },
      dateOldest: (t1: Task, t2: Task) => {
        return dateNewest(t1, t2, false)
      },
    }

    tasks.sort((task1: Task, task2: Task) => {

      for (let i = 0; i < 9; i++) {
        const compare = obj[sort[0]]
        if (compare) {
          const result = compare(task1, task2)
          if (result) return result
        }
      }

      return 0
    })

    return tasks
  },
  parseUtcTime(time: string, timeFormat: string): string {
    const t = time.toLowerCase()
    if (timeFormat === '1:00pm')
      return timezone(t, 'HH:mm').format('hh:mm a').replace(' ', '')
    return timezone(t, 'HH:mm').format('HH:mm')
  },
  getTaskInputTime(values: string[], timeFormat: SetState.timeFormat) {
    const parseTime = (time: string): string => {
      if (timeFormat === '13:00')
        return timezone(time, 'H:m').format('HH:mm')
      return timezone(time, 'H:m a').format('HH:mm a')
    }
    const isValidTime = (str: string): boolean => {
      const time = parseTime(str)
      const twelveHourFormat = timeFormat === '1:00pm'
      const format = twelveHourFormat ? 'HH:mm a' : 'HH:mm'
      return timezone(time, format, true).isValid()
    }
    for (const v of values)
      if (v && v.includes(':') && isValidTime(v.toLowerCase()) && !v.includes('24:00'))
        return parseTime(v)
    return null
  },
  getNextWeek(mom: any, nextWeek: string) {
    const clone = mom.clone()
    let i = 0
    while (true) {
      const week = clone.format('dddd')
      if (week === nextWeek)
        break
      clone.add(1, 'd')
      if (i > 10) break
      i++
    }
    return clone
  },
  getLastWeekDay(mom: any, weeknames: string[]) {
    const clone = mom.clone()
    let i = 0
    while(true) {
      const week = clone.format('dddd')
      if (weeknames.includes(week))
        break
      clone.subtract(1, 'd')
      if (i > 10) break
      i++
    }
    return clone
  },
  getUtcValuesFromTaskInputObj(obj: TaskInputObj, timeZone: string): {date: string, time: string} {
    let date = ''
    let time = ''
    if (obj.time) {
      const u = timezone.tz(`${obj.year}-${obj.month}-${obj.day} ${obj.time}`, 'Y-M-D HH:mm', timeZone).utc()
      date = u.format('Y-M-D')
      time = u.format('HH:mm')
    } else {
      const u = timezone.tz(`${obj.year}-${obj.month}-${obj.day}`, 'Y-M-D', timeZone).utc()
      date = u.format('Y-M-D')
    }
    return {date, time}
  },
  // tslint:disable-next-line:max-line-length
  parseTaskInputTime(input: string, timeFormat: SetState.timeFormat, timeZone: string, nextWeek: string): TaskInputObj & {utc: {date: string, time: string}} {
    const parseDateInput = (value: string, callback: (str: string | null) => void): any => {
      const exists = value.includes(' $')
      let str: string | null = null
      if (exists)
        str = value.substr(value.indexOf(' $')).replace(' $', '')
      return callback(str)
    }
    const isNumber = (num: any): boolean => {
      return !isNaN(parseInt(num, 10))
    }
    const getYear = (values: string[]): number => {
      for (const v of values)
        if (isNumber(v) && v.length > 3 && !v.includes(':'))
          return parseInt(v, 10)
      return timezone().year()
    }
    const getMonth = (values: string[]): number => {
      for (const str of values) {
        const mom = timezone(str, 'MMMM')
        if (mom.isValid()) return mom.month() + 1
      }
      return timezone().month() + 1
    }
    const getDay = (values: string[], month: number, year: number): number => {
      for (const v of values)
        if (isNumber(v) && v.length < 3 && parseInt(v, 10) < 32 && parseInt(v, 10) > 0)
          if (timezone(`${v}-${month}-${year}`, 'D-M-Y', true).isValid())
            return parseInt(v, 10)
      return parseInt(timezone().format('D'), 10)
    }
    const searchKeyWords = (str: string, obj: TaskInputObj): TaskInputObj => {
      const getNextWeek = (mom: any, firstDayOfTheWeek: string): any => {
        const f = firstDayOfTheWeek
        const mo = mom.clone()

        mo.add(1, 'd')
        if (f !== 'Invalid date')
          while (true) {
            if (mo.format('dddd') === f) return mo
            mo.add(1, 'd')
          }
        else return undefined
      }

      const values = str.split(' ')
      let tod = timezone()
      let m = timezone(`${obj.day}-${obj.month}-${obj.year} ${obj.time}`, 'D-M-Y HH:mm')
      let inKeyword = false
      let inHour = false

      // dont remove this
      // tslint:disable-next-line:curly
      if (str.includes('next ')) {
        for (let i = 0; i < values.length; i++)
          if (values[i] === 'next' && values[i + 1]) {
            const v = values[i + 1]
            let found = false
            switch (v) {
              case 'day': {
                tod.add(1, 'd')
                inKeyword = found = true
                break
              }
              case 'week': {
                tod = getNextWeek(tod, nextWeek)
                inKeyword = found = true
                found = true
                break
              }
              case 'month': {
                tod = tod.startOf('month').add(1, 'M')
                inKeyword = found = true
                break
              }
              case 'year': {
                tod = tod.startOf('month').startOf('year').add(1, 'y')
                inKeyword = found = true
                break
              }
            }
            if (found) break
            const ins = getNextWeek(tod, timezone(v, 'dddd').format('dddd'))
            if (ins) {
              tod = ins
              inKeyword = true
            }
            break
          }
      } else if (str.includes('tomorrow') || str.includes('tom')) {
        tod.add(1, 'd')
        inKeyword = true
      } else if (str.includes('in '))
        for (let j = 0; j < values.length; j++) {
          const q = values[j + 1]
          const k = values[j + 2]
          if (values[j] === 'in' && q && isNumber(q) && k)
            switch (k) {
              case 'days': tod.add(q, 'd'); inKeyword = true; break
              case 'months': tod.add(q, 'M'); inKeyword = true; break
              case 'weeks': tod.add(q, 'w'); inKeyword = true; break
              case 'years': tod.add(q, 'y'); inKeyword = true; break
              case 'hours': tod.add(q, 'h'); inKeyword = true; inHour = true; break
            }
        }
      if (inKeyword) m = tod

      const o: TaskInputObj = {
        year: parseInt(m.format('Y'), 10),
        month: parseInt(m.format('M'), 10),
        day: parseInt(m.format('D'), 10),
        time: obj.time,
      }
      if (inHour) o.time = m.format('HH:mm')

      return o
    }
    const searchPeriodicInput = (str: string): PeriodicObject | null => {
      const obj: PeriodicObject = {
        periodic: false,
        type: 'weekdays',
        weekDays: null,
        times: null,
        periodicInterval: 0,
        firstPeriodicDay: '',
        completedDate: '',
      }

      if (str.includes('every ')) {
        const values = str.split(' ')
        obj.periodic = true
          
        if (!isNumber(values[1])) {
          const weekDays = []
          for (const val of values) {
            const mom = timezone(val, 'dddd')
            if (mom.isValid()) weekDays.push(mom.format('dddd'))
          }
          if (weekDays.length > 0) {
            const set = new Set()
            const weeks = []
            for (const week of weekDays)
              if (!set.has(week)) {
                weeks.push(week)
                set.add(week)
              }
            obj.weekDays = weeks
          }
        } else {
          for (let j = 0;j < values.length; j++) {
            const f = values[j]
            const m = values[j + 1]
            const l = values[j + 2]
            if (f && m && l && f === 'every' && isNumber(m) && (l === 'days')) {
              obj.periodicInterval = parseInt(m, 10)
              obj.type = 'interval'
              obj.firstPeriodicDay = timezone().format('Y-M-D')
            }
          }
        }

        for (let i = 0; i < values.length; i++) {
          const f = values[i]
          const l = values[i + 1]
          if (f && l && isNumber(f) && (l === 'times' || l === 'ti')) obj.times = parseInt(f, 10)
        }
      }

      /*
        if periodic is true:
          if type = 'weekdays':
            return isWeekDay(today) and hasntEnded(times) and !alreadyCompletedToday:
            
          else if type = 'interval':
            return (today - firstPeriodicDay) % periodicInterval = 0 and hasntEnded(times) and !alreadyCompletedToday:
       */
      if (obj.periodic)
        return obj
      else return null
    }

    return parseDateInput(input, (str): any => {
      if (str) {
        const values = str.split(' ')

        const month = getMonth(values)
        const year = getYear(values)
        const day = getDay(values, month, year)
        const time = this.getTaskInputTime(values, timeFormat)

        const obj = searchKeyWords(str, {month, year, day, time})
        const perInput = searchPeriodicInput(str)
        let utc = null
        if (!perInput)
          utc = this.getUtcValuesFromTaskInputObj(obj, timeZone)

        return {...obj, utc, periodic: perInput}
      }
    })
  },
  // tslint:disable-next-line:max-line-length
  parseTaskInputObjectToString(obj: TaskInputObj | undefined, timeFormat: SetState.timeFormat, timeZone: string): string {
    if (obj && timeZone && timeFormat)
      if (!obj.periodic) {
        let time = obj.time

        const today = timezone().tz(timeZone)
        let typed!: any
        if (time)
          typed = timezone.tz(`${obj.year}-${obj.month}-${obj.day} ${time}`, 'Y-M-D HH:mm', timeZone)
        else
          typed = timezone.tz(`${obj.year}-${obj.month}-${obj.day}`, 'Y-M-D', timeZone)

        let str = ''
        if (!today.isSame(typed, 'month')) str += '' + today.month(obj.month - 1).format('MMMM') + ' '
        str += `${obj.day}`
        if (!today.isSame(typed, 'year')) str += `, ${obj.year}`

        const isToday = today.isSame(typed, 'day')
        today.add(1, 'd')
        const isTom = today.isSame(typed, 'day')

        if (isToday) str = 'Today'
        else if (isTom) str = 'Tomorrow'

        if (time) {
          if (timeFormat === '1:00pm')
            time = timezone(time, 'HH:mm').format('hh:mm a')
          str += ` at ${obj.time}`
        }
        if (!isToday && !isTom)
          str += ', ' + typed.format('dddd')

        return str
      } else {
        let str = 'every'
        const per = obj.periodic

        if (per.type === 'weekdays') {
          if (per.weekDays === null) str += ' day'
          else {
            str += ' '
            for (let i = 0;i < per.weekDays.length; i++) {
              str += timezone(per.weekDays[i], 'dddd').format('ddd')
              if (i !== per.weekDays.length -1) str += ', '
            }
          }
        } else {
          str = `every ${per.periodicInterval} days`
        }

        if (per.times !== null) str += ` ${per.times} times`

        return str
      }
    return ''
  },
}
