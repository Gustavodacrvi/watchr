
export default (property, getters) => {
  const keys = Object.keys(getters)

  const memo = (func, stringify) => {
    const cache = {}
    let getKey = stringify ? stringify : JSON.stringify

    return function() {
      const key = getKey(arguments)
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
      if (property) {
        if (property.length === undefined) {
          if (property) state[property]
        }
        else
          for (const k of property)
            state[k]        
      }
      const val = getters[k]
      const firstArg = {
        state: arguments[0],
        getters: arguments[1],
        rootState: arguments[2],
        rootGetters: arguments[3],
      }

      if (property && val.react)
        for (const el of state[property])
          for (const p of val.react)
            el[p]

      if (!val.getter)
        return memo(val.bind(this, firstArg))
      else return memo(val.getter.bind(this, firstArg), val.cache, val.type)
    }
  }
  return obj
}
