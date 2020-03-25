
export default (memoizeObject) => {
  const keys = Object.keys(memoizeObject)

  const memo = (func, stringify, functionName) => {
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
    obj[k] = function(state, getters, rootState, rootGetters) {
      const val = memoizeObject[k]
      
      const thisBinding = {}
      // TOUCH REACTIVE PROPERTIES
      if (val.deepGetterTouch) {
        
        const touchKeys = Object.keys(val.deepGetterTouch)
        
        for (const str of touchKeys) {
          thisBinding[str] = rootGetters[str]
          const targetKeys = val.deepGetterTouch[str]
          if (Array.isArray(thisBinding[str]))
          for (const targetStr of targetKeys) {
            for (const item of thisBinding[str]) {
                item[targetStr]
              }
            }
        }

      }

      if (val.touchGetters) {
        for (const str of val.touchGetters)
          thisBinding[str] = rootGetters[str]
      }

      if (val.deepStateTouch) {

        const touchKeys = Object.keys(val.deepStateTouch)

        for (const str of touchKeys) {
          const split = str.split('/')
          thisBinding[str] = rootState[split[0]][split[1]]
          const targetKeys = Object.keys(val.deepStateTouch[str])

          if (Array.isArray(thisBinding[str]))
            for (const targetStr of targetKeys) {
              for (const item of thisBinding[str])
                item[targetStr]
            }
        }

      }

      if (val.touchState) {
        for (const str of val.touchState) {
          const split = str.split('/')
          thisBinding[str] = rootState[split[0]][split[1]]
        }
      }
      
      const firstArg = {state, getters, rootState, rootGetters}
      if (!val.getter)
        return memo(val.bind(thisBinding, firstArg))
      else return memo(val.getter.bind(thisBinding, firstArg), val.cache, k)
    }
  }
  return obj
}
