
export default {
  methods: {
    addTask(obj) {
      if (this.viewList) {
        if (!obj.task.list)
          obj.task.list = this.viewList.id
        obj.task.users = this.viewList.users
        this.$store.dispatch('list/addTaskByIndex', {
          ...obj, listId: this.viewList.id
        })
      }
    },
    updateIds(ids) {
      if (this.viewList) {
        this.$store.dispatch('list/saveList', {
          tasks: ids,
          id: this.viewList.id,
        })
      }
    },
    updateHeadingIds(ids) {
      if (this.viewList) {
        this.$store.dispatch('list/updateListHeadings', {
          listId: this.viewList.id,
          ids,
        })
      }
    },
    saveHeaderName(name) {
      if (this.viewList) {
        this.$router.push('/user?list='+name)
        this.$store.dispatch('list/saveList', {
          name,
          id: this.viewList.id,
        })
      }
    },
    saveNotes(notes) {
      if (this.viewList) {
        this.$store.dispatch('list/saveList', {
          notes, id: this.viewList.id,
        })
      }
    },
    addHeading(obj) {
      if (this.viewList) {
        this.$store.dispatch('list/addHeading', {...obj, listId: this.viewList.id})
      }
    },
    onSortableAdd(evt, taskIds, type, ids) {
      if (this.viewList) {
        this.$store.dispatch('list/removeTasksFromHeading', {
          taskIds, ids, listId: this.viewList.id,
        })
      }
    },
  },
  computed: {
    icon() {return 'tasks'},
  },
}
