
export default (properties, getters) => {
  const keys = Object.keys(getters)

  const memo = (func, stringify, type) => {
    const cache = {}
    let getKey = stringify ? stringify : JSON.stringify
    let returnCached

    switch (type) {
      case Array: {
        returnCached = arr => arr.slice()
        break
      }
      case Object: {
        returnCached = obj => ({...obj})
        break
      }
      default: {
        returnCached = v => v
      }
    }

    return function() {
      const key = getKey(arguments)
      const val = cache[key]
      
      if (val !== undefined) return returnCached(val)
      
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
      for (const p of properties) state[p]
      const val = getters[k]
      const firstArg = {
        state: arguments[0],
        getters: arguments[1],
        rootState: arguments[2],
        rootGetters: arguments[3],
      }

      if ((!val.getter && !val.cache) ||
        (!val.getter && val.cache) ||
        (val.getter && !val.cache))
        return memo(val.bind(this, firstArg))
      else return memo(val.getter.bind(this, firstArg), val.cache, val.type)
    }
  }
  return obj
}
