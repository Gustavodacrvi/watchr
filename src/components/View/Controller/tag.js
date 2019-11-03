
export default {
  methods: {
    addTask(obj) {
      if (this.viewTag) {
        if (obj.task.tags.length === 0 || !obj.task.task.includes(this.viewTag.id))
          obj.task.tags.push(this.viewTag.id)
        this.$store.dispatch('task/addTask', {
          ...obj.task,
        })  
      }
    },
    saveHeaderName(name) {
      if (this.viewTag) {
        this.$router.push('/user?tag='+name)
        this.$store.dispatch('tag/saveTag', {
          name, id: this.viewTag.id
        })
      }
    },
    saveNotes(notes) {
      if (this.viewTag)
        this.$store.dispatch('tag/saveTag', {
          notes, id: this.viewTag.id
        })
    },
    addHeading() {},
    updateIds() {},
    updateHeadingIds() {},
    onSortableAdd() {},
  },
  computed: {
    icon() {return 'tag'},
  },
}
