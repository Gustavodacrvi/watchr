
export default (info, properties, getters) => {
  const keys = Object.keys(getters)

  const memo = func => {
    let cache = {}
    let versions = {}
    return function() {
      const key = JSON.stringify(arguments)
      const val = cache[key]
      const vers = versions[key]
  
      if (val) {
        if (vers === info.cacheVersion) {
          return val
        } else {
          cache = {}
          versions = {}
        }
      }
  
      const res = func.apply(null, arguments)
      cache[key] = res
      versions[key] = info.cacheVersion
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
      }))
    }
  }
  return obj
}
