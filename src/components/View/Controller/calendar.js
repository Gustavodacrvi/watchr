
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
      if (this.ungroupTasksInHeadings)
        return functionFallbacks.viewPositionFallbacks.ungroupedSmartViewRoot
      return functionFallbacks.viewPositionFallbacks.pureSmartViewRoot
    },
    mainFallbackItem() {
      return (t, f, h, a) => functionFallbacks.viewFallbacks.calendarOrder(t, f, this.getCalendarOrderDate, h, a)
    },
    
    updateIds() {
      return functionFallbacks.updateOrderFunctions.calendarOrder
    },
    onSortableAdd() {
      return (taskIds, ids) => {
        this.$store.dispatch('list/removeTasksFromSmartViewCalendarHeading', {
          taskIds, ids: utilsTask.getFixedIdsFromNonFilteredAndFiltered(ids, this.getCurrentScheduleTasksOrder || []),
          date: this.getCalendarOrderDate,
        })
      }
    },
    itemModelFallback() {
      const date = this.getCalendarOrderDate
      if (date)
        return {
          calendar: {
            type: 'specific',
            specific: date,
            editDate: date,
            begins: date,   
          },
        }
    },
    
    
    updateHeadingIds() {
      return ids => {
        this.$store.dispatch('list/updateHeadingsCalendarOrder', {
          date: this.getCalendarOrderDate,
          ids,
        })
      }
    },

    viewNameValue() {
      return this.viewName
    },
    mainFilter() {
      return task => this.isTaskShowingOnDate(task, this.calendarDate, false, true)
    },
    rootFilter() {
      if (this.ungroupTasksInHeadings)
        return t => !t.calendar.evening
      return t => !isHeadingTask(t) && !t.calendar.evening
    },
    configFilterOptions() {
      return null
    },
    tasksOrder() {
      return this.getCurrentScheduleTasksOrder
    },

    showEmptyHeadings() {
      return false
    },
    showHeading() {
      return h => h.showHeading
    },
    headings() {
      return this.getListHeadingsByView
    },
    getViewNotes() {
      return null
    },
    icon() {
      return this.$store.getters.getIcon
    },
    disableRootActions() {
      return false
    },
  },
}

