
import LoadingComponent from '@/components/LoadingComponent.vue'
import ErrorComponent from '@/components/ErrorComponent.vue'

import { Task } from '@/interfaces/app'

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
  parseTaskSpecificTime(input: string) {
    const isValidSpecificDate = (val: string, callback: (isValid: boolean, day?: number, month?: string) => void) => {
      const i = input.indexOf(' $')
      if (i > 0) {
        const str = input.substr(i).replace(' $', '')
        const values = str.split(' ')
        if (values.length < 3) {
          let month!: string
          let day!: number
          let value1 = values[0]
          let value2 = values[1]
          let isValue1Number = !isNaN(parseInt(value1))
          let isValue2Number = !isNaN(parseInt(value2))
          let areBothNumbers = isValue1Number && isValue2Number
          let atLeastOneIsaNumber = isValue1Number || isValue2Number
          let atLeastOneIsUndefined = value1 === undefined || value2 === undefined
          if (!areBothNumbers && atLeastOneIsaNumber && !atLeastOneIsUndefined) {
            if (isValue1Number) {
              day = parseInt(value1)
              month = value2
            } else {
              day = parseInt(value2)
              month = value1
            }
            callback(true, day, month)
          } else callback(false)
        } else callback(false)
      } else callback(false)
    }
    
    if (input.includes(' $every')) {
      
    } else {
      isValidSpecificDate(input, (isValid, day, month) => {
        console.log(isValid, day, month)
      })
    }
  },
}
