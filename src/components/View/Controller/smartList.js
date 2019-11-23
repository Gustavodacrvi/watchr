
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
    updateHeadingIds(ids) {
      this.$store.dispatch('list/updateHeadingsViewOrder', {
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
    viewNameValue() {
      if (this.viewType === 'search') return this.l["Search"]
      if (this.isSmart) return this.l[this.viewName]
    },
    getTasks() {
      if (this.viewType === 'search')
        return this.tasks.filter(el => el.name.includes(this.viewName))
      if (this.isSmart && this.notHeadingHeaderView) {
        if (this.viewName === 'Today' && this.hasOverdueTasks) return []
        return utilsTask.filterTasksByView(this.tasksWithoutListsAndFolders, this.viewName)
      }
      return []
    },
    tasksOrder() {
      let o = this.viewOrders[this.viewName]
      if (o && o.tasks) return this.viewOrders[this.viewName].tasks
      return []
    },
    headingsOptions() {
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
    illustration() {
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
    headerOptions() {
      return []
    },
    headingEdit() {
      if (this.viewName === "Today" || this.viewName === "Tomorrow" || this.viewName === 'Someday')
        return {
          excludeNames: this.lists.map(el => el.name),
          errorToast: "There's already another list with this name."
        }
      return []
    },
    getViewNotes() {
      return null
    },
    getPieProgress() {
      return undefined
    },
  },
}
