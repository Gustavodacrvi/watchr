
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
  taskData(task, tod) {
    return utils.getCalendarObjectData(task.calendar, tod)
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
