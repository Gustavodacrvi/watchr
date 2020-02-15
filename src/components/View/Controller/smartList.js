
import utilsTask from '@/utils/task'
import utils from '@/utils/'
import mom from 'moment'

import { pipeBooleanFilters } from '@/utils/memo'

export default {
  computed: {
    addTask() {
      return obj => {
        if (this.isSmartOrderViewType) {
          this.$store.dispatch('list/addTaskByIndexSmart', {
            ...obj, list: this.viewName,
          })
        } else {
          this.$store.dispatch('list/addTaskByIndexCalendarOrder', {
            ...obj, date: this.getCalendarOrderDate,
            ids: utilsTask.concatArraysRemovingOldEls(this.getCurrentScheduleTasksOrder, obj.ids),
          })
        }
      }
    },
    rootFallbackItem() {
      return task => task
    },
    mainFallbackItem() {
      return (task, force) => {
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
      }
    },
    
    updateIds() {
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
    removeRepeat() {},
    removeDeadline() {},
    removeHeaderTag() {},
    removeDeferDate() {},
    saveNotes() {},
    addHeading() {},
    onSortableAdd() {
      const n = this.viewName

      if (n === 'Upcoming' || n === 'Logbook' || n === 'Later lists')
        return null
      
      return (evt, taskIds, type, ids) => {
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
      if (n === 'Upcoming' || n === 'Logbook' || n === 'Later lists')
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
      if (n === 'Later lists')
        return () => false
      if (this.viewType === 'search')
        return task => this.doesTaskIncludeText(task, n)
      if (n === 'Calendar')
        return task => this.isTaskShowingOnDate(task, this.calendarDate)
      if (n === 'Inbox')
        return this.isTaskInbox
      if (n === 'Upcoming')
        return task => task.calendar
      if (this.isSmart && this.notHeadingHeaderView) {
        if (n === 'Today' && this.hasOverdueTasks)
           return task => this.isTaskInView(task, 'Overdue') ||
                         this.isTaskInView(task, 'Today')
        return task => this.isTaskInView(task, n)
      }
      return task => this.isTaskInView(task, 'Logbook')
    },
    rootFilter() {
      const n = this.viewName
      if (this.isCalendarOrderViewType && this.ungroupTasksInHeadings)
        return () => true
      if (this.viewType === 'search')
        return () => true
      if (n === 'Calendar')
        return task => !task.list && !task.folder && !task.group
      if (n === 'Today' && this.hasOverdueTasks)
        return () => false
      if (this.isSmart && this.notHeadingHeaderView)
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
      const n = this.viewName
      return n === 'Upcoming' || n === 'Logbook'
    },
    showHeading() {
      const n = this.viewName
      if (n === 'Upcoming' || n === 'Logbook' || this.isSmartOrderViewType)
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
        case 'Upcoming': return this.upcomingHeadingsOptions
        case 'Today': {
          if (this.hasOverdueTasks) return this.todayHeadingsOptions
          return heads
        }
        case 'Tomorrow': return heads
        case 'Someday': {
          return heads
        }
        case 'Later lists': return this.laterListsHeadings
        case 'Anytime': {
          return heads
        }
        case 'Calendar': {
          return heads
        }
        case 'Logbook': {
          return this.logbookHeadings
        }
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
      if (this.isSmart) {
        switch (this.viewName) {
          case 'Today': return 'star'
          case 'Later lists': return 'later-lists'
          case 'Tomorrow': return 'sun'
          case 'Inbox': return 'inbox'
          case 'Calendar': return 'calendar-star'
          case 'Pomodoro': return 'pomo'
          case 'Statistics': return 'pie'
          case 'Upcoming': return 'calendar'
          case 'Anytime': return 'layer-group'
          case 'Logbook': return 'logbook'
          case 'Someday': return 'archive'
        }
      }
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
    disableFloatingButton() {
      const n = this.viewName
      return n === 'Upcoming' || n === 'Logbook'
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
