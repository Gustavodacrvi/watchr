
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
  sortTasksByPriority(tasks: Task[]) {
    tasks.sort((a, b) => {
      const priA = a.priority
      const priB = b.priority
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
    })
  },
}
