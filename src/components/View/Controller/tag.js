import utilsTask from '@/utils/task'
import utilsTag from '@/utils/tag'
import utils from '@/utils/'
import mom from 'moment'

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
    saveSchedule(info) {
      localStorage.setItem('schedule_' + this.viewName, JSON.stringify(info))
    },
    removeDeferDate() {},
    addHeading() {},
    onSortableAdd() {},
  },
  computed: {
    icon() {return 'tag'},
    viewNameValue() {return this.viewName},
    mainFilter() {
      const tag = this.viewTag
      if (tag)
        return task => this.doesTaskPassInclusiveTags(task, [tag.id], this.tags)
      return () => false
    },
    rootFilter() {
      return () => true
    },
    
    tasksOrder() {
      const tag = this.viewTag
      if (tag && tag.tasks)
        return tag.tasks
      return []
    },
    headingsOptions() {
      return []
    },
    headerOptions() {
      const tag = this.viewTag
      if (tag)
        return utilsTag.tagOptions(tag)
      return null
    },
    getViewNotes() {
      const tag = this.viewTag
      if (tag)
        return tag.notes
      return null
    },
    getPieProgress() {
      return undefined
    },
    savedSchedule() {
      const schedule = localStorage.getItem('schedule_' + this.viewName)
      return schedule !== 'null' ? JSON.parse(schedule) : null
    },
  },
}
