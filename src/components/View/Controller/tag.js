import utilsTask from '@/utils/task'
import utilsTag from '@/utils/tag'
import utils from '@/utils/'
import mom from 'moment'

import functionFallbacks from '@/utils/functionFallbacks.js'

export default {
  computed: {
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
    
    
    icon() {return 'tag'},
    viewNameValue() {return this.viewName},
    mainFilter() {
      const tag = this.viewTag
      if (tag)
        return task => this.doesTaskPassInclusiveTags(task, [tag.id])
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
    headings() {
      const arr = []
      const viewTag = this.viewTag
      if (viewTag) {
        const tagId = viewTag.id

        arr.push({
          name: 'Logbook tasks',
          id: 'logbook tasks',
          disableSortableMount: true,
          logStr: true,
          log: true,
          icon: 'logbook',
          color: 'var(--dark-blue)',

          options: this.getLogbookOptions(),
          sort: ([], tasks) => utilsTask.sortTasksByTaskDate(tasks, 'fullLogDate'),
          filter: task => 
            this.isTaskInLogbook(task) &&
            this.doesTaskPassInclusiveTags(task, [tagId]),
          configFilterOptions: p => p !== 'pipeCompleted',
        })
      }
      return arr
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
  },
}
