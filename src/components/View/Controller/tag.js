import utilsTask from '@/utils/task'
import utilsTag from '@/utils/tag'
import utils from '@/utils/'
import mom from 'moment/src/moment'

export default {
  methods: {
    addTask(obj) {
      if (this.viewTag) {
        this.$store.dispatch('tag/addTaskByIndex', {
          ...obj, tagId: this.viewTag.id,
        })
      }
    },
    rootFallbackTask(task) {
      return task
    },
    mainFallbackTask(task, force) {
      if (force || (task.tags.length === 0 || !task.tags.includes(this.viewTag.id)))
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
    updateIds(ids) {
      if (this.viewTag) {
        this.$store.dispatch('tag/saveTag', {
          tasks: ids,
          id: this.viewTag.id,
        })
      }
    },
    removeRepeat() {},
    removeDeadline() {},
    removeHeaderTag() {},
    removeDeferDate() {},
    addHeading() {},
    onSortableAdd() {},
  },
  computed: {
    icon() {return 'tag'},
    viewNameValue() {return this.viewName},
    mainFilter() {
      if (this.viewTag)
        return task => this.doesTaskPassInclusiveTags(task, [this.viewTag.id], this.tags)
      return () => false
    },
    rootFilter() {
      return () => true
    },
    
    tasksOrder() {
      if (this.viewTag && this.viewTag.tasks)
        return this.viewTag.tasks
      return []
    },
    headingsOptions() {
      return []
    },
    headerOptions() {
      if (this.viewTag)
        return utilsTag.tagOptions(this.viewTag)
      return null
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
