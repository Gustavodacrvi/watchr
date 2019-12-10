
import utilsTask from '@/utils/task'
import utils from '@/utils/'
import mom from 'moment/src/moment'

export default {
  methods: {
    addTask(obj) {
      let calendar = null

      if (!obj.task.calendar) {
        calendar = this.getCalObjectByView(this.viewName, obj.task.calendar)
        obj.task.calendar = calendar
      }
      if (obj.task.calendar === undefined)
        obj.task.calendar = null
      this.$store.dispatch('list/addTaskByIndexSmart', {
        ...obj, list: this.viewName,
      })
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
    icon() {return null},
    updateHeadingIds(ids) {
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
    getTasks() {
      if (this.viewType === 'search')
        return task => this.doesTaskIncludeText(task, this.viewName)
      if (this.isSmart && this.notHeadingHeaderView) {
        if (this.viewName === 'Today' && this.hasOverdueTasks) return []
        return task => this.filterTasksByView([task], this.viewName).length > 0
      }
      return () => false
    },
    headingsPagination() {
      if (this.viewName !== 'Completed') return null
      return 7
    },
    tasksOrder() {
      let o = this.viewOrders[this.viewName]
      if (o && o.tasks) return this.viewOrders[this.viewName].tasks
      return []
    },
    showEmptyHeadings() {
      return this.viewName === 'Upcoming'
    },
    headingsOptions() {
      switch (this.viewName) {
        case 'Upcoming': return this.upcomingHeadingsOptions
        case 'Tomorrow': return this.getListHeadingsByView('Tomorrow')
        case 'Today': {
          // if (this.hasOverdueTasks) return this.todayHeadingsOptions
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
      return []
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
    getPieProgress() {
      return undefined
    },
  },
}
