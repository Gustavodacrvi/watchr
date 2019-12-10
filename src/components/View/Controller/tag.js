import utilsTask from '@/utils/task'
import utilsTag from '@/utils/tag'
import utils from '@/utils/'
import mom from 'moment/src/moment'

export default {
  methods: {
    addTask(obj) {
      if (this.viewTag) {
        if (obj.task.tags.length === 0 || !obj.task.tags.includes(this.viewTag.id))
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
    removeRepeat() {},
    removeDeadline() {},
    removeHeaderTag() {},
    removeDeferDate() {},
    addHeading() {},
    updateIds() {},
    onSortableAdd() {},
  },
  computed: {
    icon() {return 'tag'},
    viewNameValue() {return this.viewName},
    getTasks() {
      if (this.viewTag)
        return task => this.doesTaskPassInclusiveTags(task, [this.viewTag.id])
      return () => false
    },
    tasksOrder() {
      return []
    },
    headingsOptions() {
      return []
    },
    headerOptions() {
      if (this.viewTag)
        return utilsTag.tagOptions(this.viewTag, this.$store, this.l)
      return []
    },
    getViewNotes() {
      if (this.viewTag)
        return this.viewTag.notes
      return null
    },
    getPieProgress() {
      return undefined
    },
  },
}
