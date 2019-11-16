
import utilsTask from '@/utils/task'
import utils from '@/utils/'
import mom from 'moment'

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
    onSortableAdd() {},
  },
  computed: {
    icon() {return null},
    viewNameValue() {
      if (this.isSmart) return this.l[this.viewName]
      return this.l['Search']
    },
    getTasks() {
      if (this.viewType === 'search')
        return this.tasks.filter(el => el.name.includes(this.viewName))
      if (this.isSmart && this.notHeadingHeaderView) {
        if (this.viewName === 'Today' && this.hasOverdueTasks) return []
        return utilsTask.filterTasksByView(this.tasksWithoutLists, this.viewName)
      }
      return []
    },
    tasksOrder() {
      let o = this.viewOrders[this.viewName]
      if (o && o.tasks) o = this.viewOrders[this.viewName].tasks
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
          case 'Today':
            return {
              name: 'HappyFace',
              title: l['Enjoy the rest of the day'],
              descr: l['You already completed everything here!'],
            }
          case 'Tomorrow':
            return {
              name: 'Sleep',
              title: l['Nothing here...'],
              descr: l['You have not tasks for tomorrow.'],
              width: '150px'
            }
          case 'Inbox':
            return {
              name: 'EmptyInbox',
              title: l["Congrats! Your Inbox is empty."],
              width: '150px',
            }
          case 'Upcoming':
            return {
              name: 'EmptyCalendar',
              title: l["You don't have any upcoming tasks!"],
              width: '150px',
            }
          case 'Completed':
            return {
              name: 'CleanCheck',
              title: l["Hurray! Everything is clean here!"],
              descr: l["You don't have any completed tasks, how about completing some?"],
              width: '150px',
            }
        }
      }
    },
    headerOptions() {
      return []
    },
    headingEdit() {
      if (this.viewName === "Today" || this.viewName === "Tomorrow")
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
