
import LoadingComponent from '@/components/LoadingComponent.vue'
import ErrorComponent from '@/components/ErrorComponent.vue'

export default {
  updateArrayOrderFromFilteredArray(oldArray: any[], filteredArray: any[]): any[] {
    const ids: Set<string> = new Set()

    for (const el of filteredArray)
      ids.add(el.id)

    const arr: any[] = []
    let i = 0
    for (const el of oldArray) {
      if (ids.has(el.id)) {
        arr.push(filteredArray[i])
        i++
        continue
      }
      arr.push(el)
    }
    return arr
  },
  snakeToCamel(s: string) {
    return s.replace(/(\-\w)/g, (m: any) => m[1].toUpperCase())
  },
  asyncComponent(compPath: string) {
    return () => ({
      component: import(`${compPath}`),
      loading: LoadingComponent,
      error: ErrorComponent,
      delay: 200,
      timeout: 3000,
    })
  },
}
