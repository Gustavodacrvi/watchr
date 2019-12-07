
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
    tasks.sort(priority)
    return tasks
  },
  sortTasksByTaskDate(tasks, str) {
    let name = 'created'
    if (str) name = str
    const creationDate = (t1, t2) => {
      const m1 = mom(t1[name], 'Y-M-D')
      const m2 = mom(t2[name], 'Y-M-D')

      if (!m1.isValid() && !m2.isValid()) return 0
      if (m1.isValid() && !m2.isValid()) return -1
      if (!m1.isValid() && m2.isValid()) return 1

      if (m1.isSame(m2, 'second')) return 0
      if (m1.isBefore(m2, 'second')) return -1
      if (m2.isBefore(m1, 'second')) return 1
    }
    tasks.sort(creationDate)
    return tasks
  },
  hasCalendarBinding(task) {
    return task.calendar && task.calendar.type !== null
  },
  taskData(task, tod) {
    return utils.getCalendarObjectData(task.calendar, tod)
  },
}
