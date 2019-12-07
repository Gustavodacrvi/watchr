
export default (properties, getters) => {
  const keys = Object.keys(getters)

  const memo = func => {
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

  const obj = {}
  for (const k of keys) {
    obj[k] = function(state) {
      // for (const p of properties) state[p]
      for (const p of properties) state[p]
      return memo(getters[k].bind(this, {
        state: arguments[0],
        getters: arguments[1],
        rootState: arguments[2],
        rootGetters: arguments[3],
      }))
    }
  }
  return obj
}
