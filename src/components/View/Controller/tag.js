import utilsTask from '@/utils/task'
import utilsTag from '@/utils/tag'
import utils from '@/utils/'
import mom from 'moment'

export default {
  computed: {
    addTask() {
      return obj => {
        if (this.viewTag) {
          this.$store.dispatch('tag/addTaskByIndex', {
            ...obj, tagId: this.viewTag.id,
          })
        }
      }
    },
    rootFallbackItem() {
      return task => task
    },
    mainFallbackItem() {
      return (task, force) => {
        task.tags = []
        if (force || (task.tags.length === 0 || !task.tags.includes(this.viewTag.id)))
          task.tags.push(this.viewTag.id)
        return task
      }
    },
    
    saveHeaderName() {
      return name => {
        if (this.viewTag) {
          this.$router.push('/user?tag='+name)
          this.$store.dispatch('tag/saveTag', {
            name, id: this.viewTag.id
          })
        }
      }
    },
    saveNotes() {
      return notes => {
        if (this.viewTag)
          this.$store.dispatch('tag/saveTag', {
            notes, id: this.viewTag.id
          })
      }
    },
    updateIds() {
      return ids => {
        if (this.viewTag) {
          this.$store.dispatch('tag/saveTag', {
            tasks: ids,
            id: this.viewTag.id,
          })
        }
      }
    },
    removeRepeat() {},
    removeDeadline() {},
    removeHeaderTag() {},
    saveSchedule() {
      return info => localStorage.setItem('schedule_' + this.viewName, JSON.stringify(info))
    },
    removeDeferDate() {},
    addHeading() {},
    onSortableAdd() {},
    
    
    icon() {return 'tag'},
    viewNameValue() {return this.viewName},
    mainFilter() {
      const tag = this.viewTag
      if (tag)
        return task => this.doesTaskPassInclusiveTags(task, [tag.id], this.tags || [])
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
    headerInfo() {
      return {
        notes: {
          name: this.taggetViewNotes || null,
          save: this.tagsaveNotes,
        },
      }
    },
    headingsOptions() {
      return []
    },
    headerOptions() {
      const tag = this.viewTag
      if (tag)
        return utilsTag.tagOptions(tag, true)
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
