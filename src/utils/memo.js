
export default {
  memo() {
    const cache = {};
    return function() {
      const key = JSON.stringify(arguments)
      if (cache[key]) return cache[key]
      else {
        const val = func.apply(null, arguments)
        cache[key] = val
        return val
      }
    }
  },
}
