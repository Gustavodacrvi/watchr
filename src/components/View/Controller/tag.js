import utilsTask from '@/utils/task'
import utilsTag from '@/utils/tag'
import utils from '@/utils/'
import mom from 'moment/src/moment'

export default {
  methods: {
    addTask(obj) {
      if (this.viewTag) {
        this.$store.dispatch('task/addTask', {
          ...obj.task,
        })
      }
    },
    rootFallbackTask(task) {
      return task
    },
    mainFallbackTask(task) {
      if (task.tags.length === 0 || !task.tags.includes(this.viewTag.id))
        task.tags.push(this.viewTag.id)
      return task
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
    mainFilter() {
      if (this.viewTag)
        return task => this.doesTaskPassInclusiveTags(task, [this.viewTag.id])
      return () => false
    },
    rootFilter() {
      return () => true
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
