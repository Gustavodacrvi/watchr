
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
  sortTasksByDuration(tasks, order) {
    let num = 1
    if (order !== 'long') num = -1
    const calc = (t1, t2) => {
      const d1 = t1.taskDuration
      const d2 = t2.taskDuration

      if (!d1 && !d2) return 0
      if (d1 && !d2) return -1
      if (d2 && !d1) return 1

      const m1 = mom(d1, 'HH:mm')
      const m2 = mom(d2, 'HH:mm')

      if (m1.isSame(m2, 'minute')) return 0
      if (m1.isBefore(m2, 'minute')) return num
      if (m2.isBefore(m1, 'minute')) return -num
    }
    tasks.sort(calc)
    return tasks
  },
  sortTasksByTaskDate(tasks, str) {
    let name = 'created'
    if (str) name = str
    const creationDate = (t1, t2) => {
      const m1 = mom(t1[name], 'Y-M-D HH:mm ss')
      const m2 = mom(t2[name], 'Y-M-D HH:mm ss')

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
