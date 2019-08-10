
import LoadingComponent from '@/components/LoadingComponent.vue'
import ErrorComponent from '@/components/ErrorComponent.vue'

import { Task } from '@/interfaces/app'

import moment from 'moment'
import timezone from 'moment-timezone'

import { TaskInputObj } from '@/interfaces/app'

export default {
  AsyncComponent(comp: any): any {
    return () => ({
      component: comp,
      loading: LoadingComponent,
      error: ErrorComponent,
      delay: 200,
      timeout: 5000,
    })
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
    return sorted
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
  filterTasksByLabels(tasks: Task[], labels: string[]) {
    for (const id of labels)
      tasks = tasks.filter(el => el.labels.includes(id))
    return tasks
  },
  sortTasksByMultipleCriteria(tasks: Task[], sort: string[]): Task[] {
    const obj: {[key: string]: (task1: Task, task2: Task) => number} = {
      name: (task1: Task, task2: Task) => {
        return task1.name.localeCompare(task2.name)
      },
      priorityHighest: (task1: Task, task2: Task) => {
        const priA = task1.priority
        const priB = task2.priority
        switch (priA) {
          case 'Low priority':
            switch (priB) {
              case 'Low priority': return 0
              case 'Medium priority': return 1
              case 'High priority': return 1
              default: return -1
            }
          case 'Medium priority':
            switch (priB) {
              case 'Medium priority': return 0
              case 'High priority': return 1
              case 'Low priority': return -1
              default: return -1
            }
          case 'High priority':
            switch (priB) {
              case 'High priority': return 0
              case 'Low priority': return -1
              case 'Medium priority': return -1
              default: return -1
            }
        }
        return 0
      },
      priorityLowest: (task1: Task, task2: Task) => {
        const priA = task1.priority
        const priB = task2.priority
        switch (priA) {
          case 'Low priority':
            switch (priB) {
              case 'Low priority': return 0
              case 'Medium priority': return -1
              case 'High priority': return -1
              default: return 1
            }
          case 'Medium priority':
            switch (priB) {
              case 'Medium priority': return 0
              case 'High priority': return -1
              case 'Low priority': return 1
              default: return 1
            }
          case 'High priority':
            switch (priB) {
              case 'High priority': return 0
              case 'Low priority': return 1
              case 'Medium priority': return 1
              default: return 1
            }
        }
        return 0
      },
      creationDateNewest: (t1: Task, t2: Task) => {
        const mom1 = moment(`${t1.creationDate} ${t1.creationTime}`, 'Y-M-D HH:mm')
        const mom2 = moment(`${t2.creationDate} ${t2.creationTime}`, 'Y-M-D HH:mm')
        if (mom1.isSame(mom2)) return 0
        if (mom1.isBefore(mom2)) return -1
        if (mom1.isAfter(mom2)) return 1
        return 0
      },
      creationDateOldest: (t1: Task, t2: Task) => {
        const mom1 = moment(`${t1.creationDate} ${t1.creationTime}`, 'Y-M-D HH:mm')
        const mom2 = moment(`${t2.creationDate} ${t2.creationTime}`, 'Y-M-D HH:mm')
        if (mom1.isSame(mom2)) return 0
        if (mom1.isBefore(mom2)) return 1
        if (mom1.isAfter(mom2)) return -1
        return 0
      },
    }

    tasks.sort((task1: Task, task2: Task) => {

      for (let i = 0;i < 3;i++) {
        let compare = obj[sort[0]]
        if (compare) {
          const result = compare(task1, task2)
          if (result) return result
        }
      }

      return 0
    })

    return tasks
  },
  parseUtcTime(time: string, timeZone: string, timeFormat: string): string {
    const t = time.toLowerCase()
    if (timeFormat === '1:00pm')
      return timezone.utc(t, 'HH:mm').tz(timeZone).format('hh:mm a').replace(' ', '')
    return timezone.utc(t, 'HH:mm').tz(timeZone).format('HH:mm')
  },
  getTaskInputTime(values: string[], timeFormat: '13:00' | '1:00pm') {
    const parseTime = (time: string): string => {
      return moment(time, 'H:m').format('HH:mm')
    }
    const isValidTime = (str: string): boolean => {
      const time = parseTime(str)
      const twelveHourFormat = timeFormat === '1:00pm'
      const format = twelveHourFormat ? 'Y-M-D LT' : 'Y-M-D HH:mm'
      let momentStr = ''
      if (time.includes('pm'))
        momentStr = `2014-12-13 ${time.replace('pm', '')} pm`
      else if (time.includes('am'))
        momentStr = `2014-12-13 ${time.replace('am', '')} am`
      else momentStr = `2014-12-13 ${time}`
      return moment(momentStr, format, true).isValid()
    }
    for (const v of values)
      if (v && v.includes(':') && isValidTime(v.toLowerCase()) && !v.includes('24:00'))
        return parseTime(v)
    return null
  },
  getNextWeek(mom: any, nextWeek: string) {
    const clone = mom.clone()
    while (true) {
      clone.add(1, 'd')
      const week = clone.format('dddd')
      if (week === nextWeek)
        break
    }
    return clone
  },
  parseTaskInputTime(input: string, timeFormat: '13:00' | '1:00pm'): TaskInputObj {
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
      return moment().year()
    }
    const getMonth = (values: string[]): number => {
      for (const str of values) {
        switch (str) {
          case 'jan': return 1
          case 'feb': return 2
          case 'mar': return 3
          case 'apr': return 4
          case 'may': return 5
          case 'jun': return 6
          case 'jul': return 7
          case 'aug': return 8
          case 'sep': return 9
          case 'oct': return 10
          case 'nov': return 11
          case 'dec': return 12
        }
        switch (str) {
          case 'january': return 1
          case 'february': return 2
          case 'march': return 3
          case 'april': return 4
          case 'may': return 5
          case 'june': return 6
          case 'july': return 7
          case 'august': return 8
          case 'september': return 9
          case 'october': return 10
          case 'november': return 11
          case 'december': return 12
        }
      }
      return moment().month() + 1
    }
    const getDay = (values: string[], month: number, year: number): number => {
      for (const v of values)
        if (isNumber(v) && v.length < 3 && parseInt(v, 10) < 32 && parseInt(v, 10) > 0)
          if (moment(`${v}-${month}-${year}`, 'D-M-Y', true).isValid())
            return parseInt(v, 10)
      return parseInt(moment().format('D'), 10)
    }
    const searchKeyWords = (str: string, obj: TaskInputObj): TaskInputObj => {
      const values = str.split(' ')
      const tod = moment()
      let m = moment(`${obj.day}-${obj.month}-${obj.year} ${obj.time}`, 'D-M-Y HH:mm')
      let inKeyword = false
      let inHours = false

      if (str.includes('next '))
        for (let i = 0; i < values.length; i++)
          if (values[i] === 'next' && values[i + 1])
            switch (values[i + 1]) {
              case 'day': m.add(1, 'd'); break
              case 'month': m.add(1, 'M'); break
              case 'year': m.add(1, 'y'); break
            }
      else if (str.includes('tomorrow '))
        m.add(1, 'd')
      else if (str.includes('in '))
        for (let j = 0; j < values.length; j++) {
          const q = values[j + 1]
          const k = values[j + 2]
          if (values[j] === 'in' && q && isNumber(q) && k)
            switch (k) {
              case 'days': tod.add(q, 'd'); inKeyword = true; break
              case 'months': tod.add(q, 'M'); inKeyword = true; break
              case 'weeks': tod.add(q, 'w'); inKeyword = true; break
              case 'years': tod.add(q, 'y'); inKeyword = true; break
              case 'hours': tod.add(q, 'h'); inKeyword = true; inHours = true; break
            }
        }
      if (inKeyword) m = tod

      const o: TaskInputObj = {
        year: parseInt(m.format('Y'), 10),
        month: parseInt(m.format('M'), 10),
        day: parseInt(m.format('D'), 10),
        time: m.format('HH:mm'),
      }
      if (!obj.time)
        o['time'] = null
      if (inHours)
        o['time'] = m.format('HH:mm')

      return o
    }

    return parseDateInput(input, (str): any => {
      if (str) {
        const values = str.split(' ')

        const month = getMonth(values)
        const year = getYear(values)
        const day = getDay(values, month, year)
        const time = this.getTaskInputTime(values, timeFormat)

        const obj = searchKeyWords(str, {month, year, day, time})

        return obj
      }
    })
  },
  parseTaskInputObjectToString(obj: TaskInputObj | undefined): string {
    if (obj) {
      let str = `${moment().month(obj.month - 1).format('MMMM')} ${obj.day}, ${obj.year}`

      if (obj.time) str += ` at ${obj.time}`

      return str
    }
    return ''
  },
}
