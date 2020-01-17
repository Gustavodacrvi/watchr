
export default {
  methods: {
    fixPosition(obj, nonFilteredIds, callback) {
      nonFilteredIds = nonFilteredIds.slice()

      let fixPosition = 0
      let i = 0
      for (const id of nonFilteredIds) {
        if (!obj.ids.includes(id))
          fixPosition++
        if ((i - fixPosition) === obj.index) break
        i++
      }
      
      obj.index += fixPosition
      if (obj.newId)
        nonFilteredIds.splice(obj.index, 0, obj.newId)
      obj.ids = nonFilteredIds

      callback()
    },
  }
}
