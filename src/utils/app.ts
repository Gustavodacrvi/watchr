
import { library } from '@fortawesome/fontawesome-svg-core'

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
  importIcon(s: string, callback: () => void) {
    const camel: string = this.snakeToCamel('fa-' + s)
    import(`@fortawesome/free-solid-svg-icons/${camel}.js`).then((response: any) => {
      if (response && response.definition)
        library.add(response.definition)
      callback()
    })
  },
}
