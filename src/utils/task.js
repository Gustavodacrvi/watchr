
import mom from 'moment/src/moment'
import utilsMoment from './moment'
import utils from './index'

export default {
  sortTasksByPriority(tasks) {
    const priority = (t1, t2) => {
      const priA = t1.priority
      const priB = t2.priority
      switch (priA) {
        case 'Low priority':
          switch (priB) {
            case 'Low priority': return 0
            case 'Medium priority': return 1
            case 'High priority': return 1
            default: return -1
          }
        case 'Medium priority':
          switch (priB) {
            case 'Medium priority': return 0
            case 'High priority': return 1
            case 'Low priority': return -1
            default: return -1
          }
        case 'High priority':
          switch (priB) {
            case 'High priority': return 0
            case 'Low priority': return -1
            case 'Medium priority': return -1
            default: return -1
          }
      }
      return 0
    }
    tasks.sort((a, b) => priority(a, b))
    return tasks
  },
  hasCalendarBinding(task) {
    return task.calendar && task.calendar.type !== null
  },
  filterTasksByDay(tasks, dayMoment) {
    return tasks.filter(el => {
      if (!this.hasCalendarBinding(el) || el.calendar.type === 'someday')
        return false
      return utils.isCalendarObjectShowingToday(el.calendar, dayMoment.clone())
    })
  },
  isTaskCompleted(task, moment, compareDate) {
    const calc = () => {
      const c = task.calendar
      if (!c || c.type === 'someday' || c.type === 'specific') return task.completed
      
      if (c.manualComplete && c.lastCompleteDate) {
        const manualComplete = mom(c.manualComplete, 'Y-M-D')
        const lastComplete = mom(c.lastCompleteDate, 'Y-M-D')
        if (manualComplete.isSame(lastComplete, 'day')) return true
      }
      // const hasTimesBinding = c.times !== null && c.times !== undefined
      if (c.times !== null && c.times !== undefined) {
        if (times === 0) return true
        if (c.persistent) return c.times === 0
      }
      
      if (c.type === 'periodic' || c.type === 'weekly') {
        const lastComplete = mom(c.lastCompleteDate, 'Y-M-D')
        if (!moment) moment = mom()
        return lastComplete.isSameOrAfter(moment, 'day')
      }

      return false
      
      // SLOW AND OLD CODE
/*       if (!task.calendar || task.calendar.type === 'someday') return task.completed
      if (!moment) moment = mom()
      const {
        type, lastComplete, tod, times,
        persistent, hasTimesBinding, manualComplete
      } = this.taskData(task, moment)
      
      if (type === 'specific') return task.completed

      if (manualComplete.isSame(lastComplete, 'day')) return true
      if (hasTimesBinding && times === 0) return true
      if (hasTimesBinding && persistent) return times === 0
      
      if (type === 'periodic' || type === 'weekly') {
        return lastComplete.isSameOrAfter(tod, 'day')
      }
  
      return false */
    }
    let isCompleted = calc()
    if (compareDate) {
      if (!task.completeDate) return false
      const taskCompleteDate = mom(task.completeDate, 'Y-M-D')
      const compare = mom(compareDate, 'Y-M-D')
      return isCompleted && taskCompleteDate.isSameOrAfter(compare, 'day')
    }
    return isCompleted
  },
  filterTasksByCompletion(tasks, notCompleted, moment) {
    return tasks.filter(el => {
      const comp = this.isTaskCompleted(el, moment)
      if (notCompleted) return !comp
      return comp
    })
  },
  taskData(task, tod) {
    return utils.getCalendarObjectData(task.calendar, tod)
  },
  filterTasksByView(tasks, view) {
    switch (view) {
      case 'Inbox': {
        return tasks.filter(el =>
          !this.hasCalendarBinding(el) &&
          !el.list &&
          !el.folder &&
          el.tags.length === 0
        )
      }
      case 'Today': {
        return this.filterTasksByDay(tasks, mom())
      }
      case 'Someday': {
        return tasks.filter(t => t.calendar && t.calendar.type === 'someday')
      }
      case 'Overdue': {
        return tasks.filter(el => {
          if (!this.hasCalendarBinding(el) || this.isTaskCompleted(el)) return false
          
          const {
            spec, type, due, tod,
            nextEventAfterCompletion,
            lastComplete, lastWeeklyEvent,
            times, hasTimesBinding
          } = this.taskData(el, mom())

          if (due.isBefore(tod, 'day')) return true

          if (type === 'specific') return spec.isBefore(tod, 'day')
          if (hasTimesBinding && times === 0) return true
          if (type === 'periodic') {
            return nextEventAfterCompletion.isBefore(tod, 'day')
          }
          if (type === 'weekly') {
            return lastWeeklyEvent.isAfter(lastComplete, 'day')
          }

          return false
        })
      }
      case 'Tomorrow': {
        return this.filterTasksByDay(tasks, mom().add(1, 'day'))
      }
      case 'Completed': {
        return this.filterTasksByCompletion(tasks)
      }
    }
    
    return tasks
  },
  taskType(t) {
    const views = ['Inbox', 'Today', 'Tomorrow']
    for (const v of views)
      if (this.filterTasksByView([t], v).length > 0) return v
  },
  filterTasksByViewRendererFilterOptions(tasks, tags, list) {
    let ts = tasks
    if (tags.length > 0)
      ts = ts.filter(el => tags.every(id => el.tags.includes(id)))
    if (list)
      ts = ts.filter(el => el.list === list)
    return ts
  },
}
