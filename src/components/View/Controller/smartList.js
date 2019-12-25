
import utilsTask from '@/utils/task'
import utils from '@/utils/'
import mom from 'moment/src/moment'

import { pipeBooleanFilters } from '@/utils/memo'

export default {
  methods: {
    addTask(obj) {
      this.$store.dispatch('list/addTaskByIndexSmart', {
        ...obj, list: this.viewName,
      })
    },
    rootFallbackTask(task) {
      return task
    },
    mainFallbackTask(task) {
      let calendar = null

      if (!task.calendar) {
        calendar = this.getCalObjectByView(this.viewName, task.calendar)
        task.calendar = calendar
      }
      if (task.calendar === undefined)
        task.calendar = null
      return task
    },
    
    updateIds(ids) {
      this.$store.dispatch('list/updateViewOrder', {
        view: this.viewName,
        ids,
      })
    },
    removeRepeat() {},
    removeDeadline() {},
    removeHeaderTag() {},
    saveHeaderName() {},
    removeDeferDate() {},
    saveNotes() {},
    addHeading() {},
    onSortableAdd(evt, taskIds, type, ids) {
      this.$store.dispatch('list/removeTasksFromSmartViewHeading', {
        taskIds, view: this.viewName, ids,
      })
    },
  },
  computed: {
    updateHeadingIds() {
      if (this.viewName !== 'Upcoming' && this.viewName !== 'Completed')
        return ids => {
            this.$store.dispatch('list/updateHeadingsViewOrder', {
            view: this.viewName,
            ids,
          })
        }
      return null
    },
    viewNameValue() {
      if (this.viewType === 'search') return this.l["Search"]
      if (this.isSmart) return this.l[this.viewName]
    },

    mainFilter() {
      if (this.viewType === 'search')
        return task => this.doesTaskIncludeText(task, this.viewName)
      if (this.viewName === 'Inbox')
        return this.isTaskInbox
      if (this.viewName === 'Upcoming')
        return task => task.calendar
      if (this.isSmart && this.notHeadingHeaderView) {
        if (this.viewName === 'Today' && this.hasOverdueTasks) return task => {
          return this.isTaskInView(task, 'Today') ||
                this.isTaskInView(task, 'Overdue')
        }
        return task => this.isTaskInView(task, this.viewName)
      }
      return this.isTaskCompleted
    },
    rootFilter() {
      if (this.viewType === 'search')
        return () => true
      if (this.viewName === 'Today' && this.hasOverdueTasks)
        return () => false
      if (this.isSmart && this.notHeadingHeaderView)
        return pipeBooleanFilters(
          task => this.isTaskInView(task, this.viewName),
          task => !task.list && !task.folder,
        )
      return () => false
    },
    configFilterOptions() {
      if (this.viewName === 'Completed')
        return pipe => pipe !== 'pipeCompleted' && pipe !== 'pipeSomeday'
      return null
    },
    tasksOrder() {
      let o = this.viewOrders[this.viewName]
      if (o && o.tasks) return this.viewOrders[this.viewName].tasks
      return []
    },

    headingsPagination() {
      if (this.viewName !== 'Completed') return null
      return 7
    },
    showEmptyHeadings() {
      return this.viewName === 'Upcoming'
    },
    showHeading() {
      if (this.viewName !== 'Upcoming') return null
      return h => {
        return h.showHeading
      }
    },
    headings() {
      switch (this.viewName) {
        case 'Upcoming': return this.upcomingHeadingsOptions
        case 'Tomorrow': return this.getListHeadingsByView('Tomorrow')
        case 'Today': {
          if (this.hasOverdueTasks) return this.todayHeadingsOptions
          return this.getListHeadingsByView('Today')
        }
        case 'Someday': {
          return this.getListHeadingsByView('Someday')
        }
        case 'Completed': {
          return this.completedHeadingsOptions
        }
      }
      return []
    },
    headerOptions() {
      return null
    },
    headingEditOptions() {
      if (this.viewName === "Today" || this.viewName === "Tomorrow" || this.viewName === 'Someday')
        return {
          excludeNames: this.lists.map(el => el.name),
          errorToast: "There's already another list with this name."
        }
      return null
    },
    getViewNotes() {
      return null
    },
    icon() {
      const l = this.l
      const n = this.viewName
      if (this.isSmart) {
        switch (n) {
          case 'Today': return 'star'
          case 'Tomorrow': return 'sun'
          case 'Inbox': return 'inbox'
          case 'Upcoming': return 'calendar'
          case 'Completed': return 'circle-check'
          case 'Someday': return 'archive'
        }
      }
    },
    getPieProgress() {
      return undefined
    },
  },
}
