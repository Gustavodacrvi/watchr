
export default {
  methods: {
    addTask(obj) {
      let calendar = null

      if (!obj.task.calendar) {
        calendar = this.getCalObjectByView(this.viewName, obj.task.calendar)
        obj.task.calendar = calendar
      }
      if (obj.task.calendar === undefined)
        obj.task.calendar = null
      this.$store.dispatch('list/addTaskByIndexSmart', {
        ...obj, list: this.viewName,
      })
    },
    updateIds(ids) {
      this.$store.dispatch('list/updateViewOrder', {
        view: this.viewName,
        ids,
      })
    },
    updateHeadingIds(ids) {
      this.$store.dispatch('list/updateHeadingsViewOrder', {
        view: this.viewName,
        ids,
      })
    },

    saveHeaderName() {},
    saveNotes() {},
    addHeading() {},
    onSortableAdd() {},
  },
  computed: {
    icon() {return null},
  },
}
