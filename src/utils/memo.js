
export const memoize = func => {
  const cache = {}
  return function() {
    const key = JSON.stringify(arguments)
    const val = cache[key]

    if (val !== undefined) return val

    let res = func.apply(null, arguments)
    if (res === undefined)
      res = null
    cache[key] = res
    return res
  }
}

export const pipeBooleanFilters = (...filters) => {
    return (...args) => {
      let i = 0
      const run = filter => {
        if (!filter(...args)) return false
        i++
        return filters[i] ? run(filters[i]) : true
      }
      return run(filters[0])
    }
  }
