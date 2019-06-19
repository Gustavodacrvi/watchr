
export default {
  getArrFromStringPath(path: string, ignoreLastTwoDots: boolean = true): string[] {
    if (ignoreLastTwoDots && path.slice(-1) === ':') {
      path = path.slice(0, path.length - 1)
    }
    return path.split(':').map((el: string) => el.trim())
  },
  getStringPathFromArr(arr: string[]): string {
    let str = ''
    let i = 0
    for (const el of arr) {
      str += el
      if (i + 1 !== arr.length) {
        str += ':'
      }
      i++
    }
    return str
  },
}
