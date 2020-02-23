
import utilsTask from '@/utils/task'
import utils from '@/utils/'
import mom from 'moment'

import functionFallbacks from '@/utils/functionFallbacks.js'

export default {
  computed: {
    fallbackFunctionData() {
      return () => ({
        calendarDate: this.getCalendarOrderDate,
      })
    },
    rootFallbackItem() {
      if (this.viewName === 'Recurring')
        return null

      return functionFallbacks.viewPositionFallbacks.pureSmartViewRoot
    },
    mainFallbackItem() {
      const fs = functionFallbacks.viewFallbacks
      if (this.isCalendarOrderViewType)
        return (t, f) => fs.calendarOrder(t, f, this.getCalendarOrderDate)
      if (this.viewName === 'Deadlines')
        return fs.deadlineOrder
      return fs[this.viewName]
      
/*       return (task, force) => {
        if (this.viewName === 'Calendar') {
          const date = this.calendarDate
    
          if (force || !task.calendar)
            task.calendar = {
              type: 'specific',
              begins: date,
              editDate: date,
              specific: date,
            }
        } else {
          let calendar = null
  
          if (force || !task.calendar) {
            calendar = this.getCalObjectByView(this.viewName, task.calendar)
            task.calendar = calendar
          }
        }
  
        if (task.calendar === undefined)
          task.calendar = null
        return task
      } */
    },
    
    updateIds() {
      const fs = functionFallbacks.updateOrderFunctions
      if (this.isCalendarOrderViewType)
        return fs.calendarOrder
      return fs.smartOrder
      
      return ids => {
        if (this.isSmartOrderViewType) {
          this.$store.dispatch('list/updateViewOrder', {
            view: this.viewName,
            ids,
          })
        } else {
          this.$store.dispatch('task/saveCalendarOrder', {
            ids: utilsTask.concatArraysRemovingOldEls( this.getCurrentScheduleTasksOrder, ids),
            date: this.getCalendarOrderDate,
          })
        }
      }
    },
    saveSchedule() {
      return schedule => {
        if (!this.isCalendarOrderViewType) {
          localStorage.setItem('schedule_' + this.viewName, JSON.stringify(schedule))
        } else {
          this.$store.dispatch('task/saveSchedule', {
            schedule, date: this.getCalendarOrderDate,
          })
        }
      }
    },
    onSortableAdd() {
      const n = this.viewName

      if (this.isFixedHeadingsView)
        return null
      
      return (taskIds, ids) => {
        if (this.isSmartOrderViewType)
          this.$store.dispatch('list/removeTasksFromSmartViewHeading', {
            taskIds, view: n, ids,
          })
        else {
          this.$store.dispatch('list/removeTasksFromSmartViewCalendarHeading', {
            taskIds, ids: utilsTask.getFixedIdsFromNonFilteredAndFiltered(ids, this.getCurrentScheduleTasksOrder || []),
            date: this.getCalendarOrderDate,
          })
        }
      }
    },
    
    
    updateHeadingIds() {
      const n = this.viewName
      if (this.isFixedHeadingsView)
        return null
      
      if (this.isSmartOrderViewType)
        return ids => {
            this.$store.dispatch('list/updateHeadingsViewOrder', {
            view: this.viewName,
            ids,
          })
        }
      return ids => {
        this.$store.dispatch('list/updateHeadingsCalendarOrder', {
          date: this.getCalendarOrderDate,
          ids,
        })
      }
    },

    viewNameValue() {
      if (this.viewType === 'search') return "Search"
      if (this.isSmart) return this.viewName
    },
    mainFilter() {
      const n = this.viewName
      if (this.viewType === 'search')
        return task => this.doesTaskIncludeText(task, n)
      if (n === 'Today' && this.hasOverdueTasks)
        return task => this.isTaskInView(task, 'Overdue') ||
                        this.isTaskInView(task, 'Today')
      switch (n) {
        case 'Later lists': return () => false
        case 'Calendar': return task => this.isTaskShowingOnDate(task, this.calendarDate)
        case 'Upcoming': return task => task.calendar
        case 'Logged lists': return t => false
      }
      return task => this.isTaskInView(task, n)
    },
    rootFilter() {
      const n = this.viewName
      if (this.viewType === 'search')
        return () => true
      if (this.isCalendarOrderViewType && this.ungroupTasksInHeadings)
        return () => true
      if (n === 'Recurring' || n === 'Inbox')
        return () => true
      if (n === 'Calendar')
        return task => !task.list && !task.folder && !task.group
      if (n === 'Today' && this.hasOverdueTasks)
        return () => false
      if (n === 'Today' || n === 'Tomorrow' || n === 'Anytime' || n === 'Someday')
        return task => !task.list && !task.folder && !task.group
      return () => false
    },
    configFilterOptions() {
      if (this.viewName === 'Logbook')
        return pipe => pipe !== 'pipeCanceled' && pipe !== 'pipeCompleted' && pipe !== 'pipeSomeday'
      return null
    },
    tasksOrder() {
      const n = this.viewName
      const orders = this.viewOrders
      if (this.isSmartOrderViewType) {
        let o = orders[n]
        if (o && o.tasks) return orders[n].tasks
        return []
      }
      return this.getCurrentScheduleTasksOrder
    },

    showEmptyHeadings() {
      return this.isFixedHeadingsView
    },
    showHeading() {
      const n = this.viewName
      if (this.isFixedHeadingsView || this.isSmartOrderViewType)
        return h => {
          return h.showHeading
        }
      return null
    },
    headings() {
      if (this.isCalendarOrderViewType && this.ungroupTasksInHeadings) 
        return []
      const heads = this.getListHeadingsByView
      switch (this.viewName) {
        case 'Upcoming': return this.upcomingHeadings
        case 'Recurring': return this.recurringHeadings
        case 'Today': {
          if (this.hasOverdueTasks) return this.todayHeadingsOptions
          return heads
        }
        case 'Tomorrow': return heads
        case 'Someday': return heads
        case 'Deadlines': return this.deadlinesViewHeadings
        case 'Later lists': return this.laterListsHeadings
        case 'Anytime': return heads
        case 'Calendar': return heads
        case 'Logbook': return this.logbookHeadings
        case 'Logged lists': return this.logbookLists
      }
      return []
    },
    showAllHeadingsItems() {
      return this.viewName === 'Today' && this.isSmart
    },
    headerOptions() {
      return null
    },
    headingEditOptions() {
      const n = this.viewName
      if (n === "Today" || n === "Tomorrow" || n === 'Someday' || n === 'Anytime')
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
      return this.isSmart ? this.$store.getters.getIcon : null
    },
    smartComponent() {
      if (this.viewName === 'Calendar')
        return 'ViewRendererLongCalendarPicker'
      return null
    },
    onSmartComponentUpdate() {
      return date => this.calendarDate = date
    },
    viewComponent() {
      const n = this.viewName
      if (n === 'Pomodoro') return 'Pomodoro'
      if (n === 'Statistics') return 'Statistics'
    },
    disableRootActions() {
      return this.disableRootActionsSmartView
    },
    savedSchedule() {
      const n = this.viewName
      if (!this.isCalendarOrderViewType) {
        const schedule = localStorage.getItem('schedule_' + n)
        return schedule !== 'null' ? JSON.parse(schedule) : null
      }
      if (this.calendarOrders) {
        let date = this.getCalendarOrderDate
        const schedule = (this.calendarOrders[date] && this.calendarOrders[date].schedule)
        if (date && schedule)
          return {...schedule}
      }
      return null
    },
  },
}
