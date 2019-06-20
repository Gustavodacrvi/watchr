
export default {
  updateArrayOrderFromFilteredArray(oldArray: any[], filteredArray: any[]): any[] {
    const ids: Set<string> = new Set()

    for (const el of filteredArray) {
      ids.add(el.id)
    }

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
}
