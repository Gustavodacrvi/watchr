
import LoadingComponent from '@/components/LoadingComponent.vue'
import ErrorComponent from '@/components/ErrorComponent.vue'

import { Task } from '@/interfaces/app'

import moment from 'moment'

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
      priority: (task1: Task, task2: Task) => {
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
    }

    tasks.sort((task1: Task, task2: Task) => {

      let compare = obj[sort[0]]
      if (compare) {
        const result = compare(task1, task2)
        if (result) return result
      }
      compare = obj[sort[1]]
      if (compare) {
        const result = compare(task1, task2)
        if (result !== undefined) return result
      }

      return 0
    })

    return tasks
  },
  getMonthByName(input: string): number | undefined {
    const str = input.toLowerCase()
    switch(str) {
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
    switch(str) {
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
    return undefined
  },
  parseTaskInputTime(input: string, timeFormat: '13:00' | '1:00pm') {
    const parseDateInput = (input: string, callback: (str: string | null) => void) => {
      const exists = input.includes(' $')
      let str: string | null = null
      if (exists) {
        str = input.substr(input.indexOf(' $')).replace(' $', '')
      }
      return callback(str)
    }
    const isNumber = (num: any): boolean => {
      return !isNaN(parseInt(num))
    }
    const getTime = (values: string[]): string | undefined => {
      const isValidTime = (time: string): boolean => {
        const twelveHourFormat = timeFormat === '1:00pm'
        const format = twelveHourFormat ? 'YYYY-MM-DD LT' : 'YYYY-MM-DD HH:mm'
        let momentStr = ''
        if (time.includes('pm')) {
          momentStr = `2014-12-13 ${time.replace('pm', '')} pm`
        } else if (time.includes('am')) {
          momentStr = `2014-12-13 ${time.replace('am', '')} am`
        } else momentStr = `2014-12-13 ${time}`

        return moment(momentStr, format, true).isValid()
      }
      
      for (let i = 0; i < values.length;i++)
        if (values[i] && isValidTime(values[i]))
          return values[i]
      return undefined
    }
    const getYear = (values: string[]): number => {
      for (let i = 0; i < values.length;i++)
        if (isNumber(values[i]) && values[i].length > 3)
          return parseInt(values[i])
      return moment().year()
    }
    const getMonth = (values: string[]): number => {
      for (let i = 0; i < values.length;i++) {
        const str = values[i].toLocaleLowerCase()
        switch(str) {
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
        switch(str) {
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
    const getDay = (values: string[], month: number, year: number): number | undefined => {
      for (let i = 0; i < values.length;i++) {
        const v = values[i]
        if (isNumber(v) && v.length < 3 && parseInt(v) < 32 && parseInt(v) > 0) {
          console.log(moment(`${v}-${month}-${year}`, 'D-M-Y', true).isValid())
          if (moment(`${v}-${month}-${year}`, 'D-M-Y', true).isValid()) {
            return parseInt(v)
          }
        }
      }
      return undefined
    }

    return parseDateInput(input, (str) => {
      if (str) {
        const values = str.split(' ')
        
        let month = getMonth(values)
        let year = getYear(values)
        let day = getDay(values, month, year)
        let time = getTime(values)
  
        return {
          year,
          day,
          time,
          month,
        }
      }
    })
  },
}
