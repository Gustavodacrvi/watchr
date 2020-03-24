
import utilsTask from '@/utils/task'
import utils from '@/utils/'
import mom from 'moment'

import functionFallbacks from '@/utils/functionFallbacks.js'

export default {
  computed: {
    fallbackFunctionData() {
      return () => ({
        calendarDate: this.getCalendarOrderDate,
        scheduleOrder: this.getCurrentScheduleTasksOrder,
      })
    },
    rootFallbackItem() {
      if (this.viewName === 'Recurring')
        return null

      if (this.ungroupTasksInHeadings)
        return functionFallbacks.viewPositionFallbacks.ungroupedSmartViewRoot
      return functionFallbacks.viewPositionFallbacks.pureSmartViewRoot
    },
    mainFallbackItem() {
      const fs = functionFallbacks.viewFallbacks
      if (this.isCalendarOrderViewType)
        return (t, f, h, a) => fs.calendarOrder(t, f, this.getCalendarOrderDate, h, a)
      if (this.viewName === 'Deadlines')
        return fs.deadlineOrder
      if (this.viewName === 'Upcoming')
        return t => t
      
      return fs[this.viewName]
    },
    
    updateIds() {
      const fs = functionFallbacks.updateOrderFunctions
      if (this.isCalendarOrderViewType)
        return fs.calendarOrder
      return fs.smartOrder
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
        case 'Assigned to me': return t => t.assigned === this.user.uid
      }
      return task => this.isTaskInView(task, n)
    },
    rootFilter() {
      const n = this.viewName
      if (this.viewType === 'search')
      return () => true
      if (n === 'Recurring' || n === 'Inbox')
        return () => true
        
      if (n === 'Today' && this.hasOverdueTasks)
        return () => false

      if (this.isCalendarOrderViewType && this.ungroupTasksInHeadings)
        return t => !t.calendar.evening


      const isHeadingTask = t => t.list || t.folder || t.group

      if (this.isSmartOrderViewType)
        return t => !isHeadingTask(t)
      
      if (this.isCalendarOrderViewType)
        return t => !isHeadingTask(t) && !t.calendar.evening
        
      return () => false
    },
    configFilterOptions() {
      const n = this.viewName
      if (n === 'Logbook' || this.viewType === 'Search')
        return pipe => pipe !== 'pipeCanceled' && pipe !== 'pipeCompleted' && pipe !== 'pipeSomeday'
      if (n === 'Recurring' || n === 'Later lists')
        return pipe => pipe !== 'pipeSomeday' && pipe !== 'pipeCompleted'
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
      if (this.isFixedHeadingsView || this.isSmartOrderViewType || this.isCalendarOrderViewType)
        return h => h.showHeading
      return null
    },
    headings() {
      if (this.viewType === 'search')
        return this.searchHeadings
      const heads = this.getListHeadingsByView
      switch (this.viewName) {
        case 'Upcoming': return this.upcomingHeadings
        case 'Recurring': return this.recurringHeadings
        case 'Today': {
          console.log
          if (this.hasOverdueTasks) return this.todayHeadingsOptions
          return heads
        }
        case 'Tomorrow': return heads
        case 'Someday': return heads
        case 'Assigned to me': return heads
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
      return this.isCalendarOrderViewType
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
    disableRootActions() {
      return this.isFixedHeadingsView
    },
  },
}