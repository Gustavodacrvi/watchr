
import mom from "moment"
import utilsMoment from './moment'

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
  filterTasksByCompletion(tasks) {
    return tasks.filter(el => {
      if (!el.calendar) return el.completed
      const {
        type, lastComplete, tod,
      } = this.taskData(el, mom())

      if (type === 'specific') return el.completed
      
      if (type === 'periodic' || type === 'weekly') {
        return lastComplete.isSameOrAfter(tod, 'day')
      }

      return false
    })
  },
  taskData(task, tod) {
    const c = task.calendar

    const obj = {
      tod,
      type: c.type,
      defer: mom(c.defer, 'Y-M-D'),
      due: mom(c.due, 'Y-M-D'),
      spec: mom(c.specific, 'Y-M-D'),
      edit: mom(c.editDate, 'Y-M-D'),
      lastComplete: mom(c.lastCompleteDate, 'Y-M-D'),
      nextEventAfterCompletion: mom(),
      lastWeeklyEvent: mom(),
      interval: c.periodic,
      weekDays: c.weekly,
    }

    if (obj.lastComplete.isValid()) {
      obj.nextEventAfterCompletion = obj.lastComplete.clone().add(obj.interval, 'day')
    } else {
      obj.nextEventAfterCompletion = obj.edit.clone()
    }
    if (obj.type !== 'weekly') obj.lastWeeklyEvent = null
    else {
      obj.lastWeeklyEvent = utilsMoment.getLastInstanceOfaWeek(tod, obj.weekDays)
    }

    return obj
  },
  filterTasksByView(tasks, view) {
    switch (view) {
      case 'Inbox': {
        return tasks.filter(el => !el.calendar && !el.list && el.tags.length === 0)
      }
      case 'Today': {
        return this.filterTasksByDay(tasks, mom())
      }
      case 'Overdue': {
        return tasks.filter(el => {
          if (!el.calendar) return false
          
          const {
            spec, type, due, tod,
            nextEventAfterCompletion,
            lastComplete, lastWeeklyEvent,
          } = this.taskData(el, mom())

          const isOverdue = (due.isBefore(tod, 'day'))

          if (isOverdue) return true

          if (type === 'specific' && spec.isBefore(tod, 'day')) return true
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
    }
    
    return tasks
  }
}
