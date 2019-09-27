
import mom, { weekdays } from "moment"

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
  sortTasksByDate(tasks) {
    // TODO
  },
  filterTasksByDay(tasks, dayMoment) {
    return tasks.filter(el => {
      if (!el.calendar) return false
      const {
        type, defer, due, tod,
        edit, spec, interval,
        weekDays,
      } = this.taskData(el, dayMoment.clone())
      const isOverdue = (due.isBefore(tod, 'day'))
      const isntReadyYet = (defer.isAfter(tod, 'day'))
      const notToday = (!tod.isSame(spec, 'day'))

      if (isOverdue) return false
      if (isntReadyYet) return false

      if (type === 'specific' && notToday) return false
      if (type === 'periodic') {
        const dayDiff = tod.diff(edit, 'day')
        const eventNotToday = dayDiff % interval !== 0
        if (eventNotToday) return false
      }
      if (type === 'weekly') {
        const todaysWeekDayName = tod.format('ddd').toLowerCase()
        const eventNotToday = !weekDays.find(w => w.toLowerCase() === todaysWeekDayName)
        if (eventNotToday) return false
      }

      return true
    })
  },
  taskData(t, tod) {
    const c = t.calendar

    return {
      tod,
      type: c.type,
      defer: mom(c.defer, 'Y-M-D'),
      due: mom(c.due, 'Y-M-D'),
      spec: mom(c.specific, 'Y-M-D'),
      edit: mom(c.editDate, 'Y-M-D'),
      interval: c.periodic.interval,
      weekDays: c.weekly,
    }
  },
  filterTasksByView(tasks, view) {
    switch (view) {
      case 'Inbox': {
        return tasks
        // return tasks.filter(el => !el.calendar && !el.list && el.tags.length === 0)
      }
      case 'Today': {
        return this.filterTasksByDay(tasks, mom())
      }
      case 'Tomorrow': {
        return this.filterTasksByDay(tasks, mom().add(1, 'day'))
      }
    }
    
    return tasks
  }
}
