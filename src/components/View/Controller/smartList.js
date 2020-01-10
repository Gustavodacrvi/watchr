
import utilsTask from '@/utils/task'
import utils from '@/utils/'
import mom from 'moment'

import { pipeBooleanFilters } from '@/utils/memo'

export default {
  methods: {
    addTask(obj) {
      if (this.isSmartOrderViewType) {
        this.$store.dispatch('list/addTaskByIndexSmart', {
          ...obj, list: this.viewName,
        })
      } else {
        obj.ids = utilsTask.getFixedIdsFromNonFilteredAndFiltered(obj.ids, (this.calendarOrders[this.calendarDate] && this.calendarOrders[this.calendarDate].tasks) || []),
        this.$store.dispatch('list/addTaskByIndexCalendarOrder', {
          ...obj, date: this.calendarDate,
        })
      }
    },
    rootFallbackTask(task) {
      return task
    },
    mainFallbackTask(task, force) {
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
    },
    
    updateIds(ids) {
      if (this.isSmartOrderViewType) {
        this.$store.dispatch('list/updateViewOrder', {
          view: this.viewName,
          ids,
        })
      } else {
        let currentDate = mom()
        if (this.viewName === 'Tomorrow')
          currentDate.add(1, 'd')

        currentDate = currentDate.format('Y-M-D')

        if (this.viewName === 'Calendar')
          currentDate = this.calendarDate

        this.$store.dispatch('task/saveCalendarOrder', {
          ids: utilsTask.getFixedIdsFromNonFilteredAndFiltered(ids, (this.calendarOrders[currentDate] && this.calendarOrders[currentDate].tasks) || []),
          date: currentDate,
        })
      }
    },
    saveSchedule(schedule) {
      if (!this.isCalendarOrderViewType) {
        localStorage.setItem('schedule_' + this.viewName, JSON.stringify(schedule))
      } else {
        const save = date =>
          this.$store.dispatch('task/saveSchedule', {
            schedule, date,
          })
        
        if (this.viewName === 'Today')
          save(mom().format('Y-M-D'))
        else if (this.viewName === 'Tomorrow')
          save(mom().add(1, 'd').format('Y-M-D'))
        else
          save(this.calendarDate)
        
      }
    },
    removeRepeat() {},
    removeDeadline() {},
    removeHeaderTag() {},
    saveHeaderName() {},
    removeDeferDate() {},
    saveNotes() {},
    addHeading() {},
    onSortableAdd(evt, taskIds, type, ids) {
      if (this.isSmartOrderViewType)
        this.$store.dispatch('list/removeTasksFromSmartViewHeading', {
          taskIds, view: this.viewName, ids,
        })
      else {
        let currentDate = mom()
        if (this.viewName === 'Tomorrow')
          currentDate.add(1, 'd')

        currentDate = currentDate.format('Y-M-D')

        if (this.viewName === 'Calendar')
          currentDate = this.calendarDate

        this.$store.dispatch('list/removeTasksFromSmartViewCalendarHeading', {
          taskIds, ids: utilsTask.getFixedIdsFromNonFilteredAndFiltered(ids, (this.calendarOrders[currentDate] && this.calendarOrders[currentDate].tasks) || []),
          date: currentDate,
        })
      }
    },
  },
  computed: {
    updateHeadingIds() {
      if (this.isSmartOrderViewType)
        return ids => {
            this.$store.dispatch('list/updateHeadingsViewOrder', {
            view: this.viewName,
            ids,
          })
        }
      
      return ids => {
        this.$store.dispatch('list/updateHeadingsCalendarOrder', {
          date: this.calendarDate,
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
      const n = this.viewName
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
      return this.isTaskCompleted
    },
    rootFilter() {
      const n = this.viewName
      if (this.viewType === 'search')
        return () => true
      if (n === 'Calendar')
        return task => !task.list && !task.folder
      if (n === 'Today' && this.hasOverdueTasks)
        return () => false
      if (this.isSmart && this.notHeadingHeaderView)
        return task => !task.list && !task.folder
      return () => false
    },
    configFilterOptions() {
      if (this.viewName === 'Completed')
        return pipe => pipe !== 'pipeCompleted' && pipe !== 'pipeSomeday'
      return null
    },
    tasksOrder() {
      const n = this.viewName
      if (this.isSmartOrderViewType) {
        let o = this.viewOrders[n]
        if (o && o.tasks) return this.viewOrders[n].tasks
        return []
      }
      let currentDate = mom()
      if (n === 'Tomorrow')
        currentDate.add(1, 'd')

      currentDate = currentDate.format('Y-M-D')

      if (n === 'Calendar')
        currentDate = this.calendarDate

      return (this.calendarOrders[currentDate] && this.calendarOrders[currentDate].tasks) || []
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
        case 'Today': {
          if (this.hasOverdueTasks) return this.todayHeadingsOptions
          return this.getListHeadingsByView('Today')
        }
        case 'Tomorrow': return this.getListHeadingsByView('Tomorrow')
        case 'Someday': {
          return this.getListHeadingsByView('Someday')
        }
        case 'Anytime': {
          return this.getListHeadingsByView('Anytime')
        }
        case 'Calendar': {
          return this.getListHeadingsByView('Calendar')
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
          case 'Tomorrow': return 'sun'
          case 'Inbox': return 'inbox'
          case 'Calendar': return 'calendar-star'
          case 'Pomodoro': return 'pomo'
          case 'Statistics': return 'pie'
          case 'Upcoming': return 'calendar'
          case 'Anytime': return 'layer-group'
          case 'Completed': return 'circle-check'
          case 'Someday': return 'archive'
        }
      }
    },
    getPieProgress() {
      return undefined
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
    savedSchedule() {
      const n = this.viewName
      if (!this.isCalendarOrderViewType) {
        const schedule = localStorage.getItem('schedule_' + n)
        return schedule !== 'null' ? JSON.parse(schedule) : null
      }
      if (this.calendarOrders) {
        let date = ''

        if (n === 'Today')
          date = mom().format('Y-M-D')
        else if (n === 'Tomorrow')
          date = mom().add(1, 'd').format('Y-M-D')
        else if (n === 'Calendar')
          date = this.calendarDate || null

        if (date)
          return (this.calendarOrders[date] && this.calendarOrders[date].schedule)
      }
      return null
    },
  },
}
