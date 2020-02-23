import utilsTask from '@/utils/task'
import utilsTag from '@/utils/tag'
import utils from '@/utils/'
import mom from 'moment'

import functionFallbacks from '@/utils/functionFallbacks.js'

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
      return t => t
    },
    fallbackFunctionData() {
      return () => ({
        tagId: this.viewTag.id,
      })
    },
    mainFallbackItem() {
      return (t, f) => functionFallbacks.viewFallbacks.Tag(t, f, this.viewTag.id)
    },
    updateIds() {
      return functionFallbacks.updateOrderFunctions.Tag
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
    removeHeaderTag() {},
    saveSchedule() {
      return info => localStorage.setItem('schedule_' + this.viewName, JSON.stringify(info))
    },
    
    
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
          save: notes => {
            if (this.viewTag)
              this.$store.dispatch('tag/saveTag', {
                notes, id: this.viewTag.id
              })
          },
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
