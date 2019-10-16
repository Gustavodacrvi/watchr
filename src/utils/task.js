
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
  hasCalendarBinding(task) {
    return task.calendar && task.calendar.type !== null
  },
  filterTasksByDay(tasks, dayMoment) {
    return tasks.filter(el => {
      if (!this.hasCalendarBinding(el)) return false
      const {
        type, defer, due, tod,
        edit, spec, interval,
        weekDays, times, persistent,
        hasTimesBinding,
      } = this.taskData(el, dayMoment.clone())
      const isOverdue = (due.isBefore(tod, 'day'))
      const isntReadyYet = (defer.isAfter(tod, 'day'))
      const notToday = (!tod.isSame(spec, 'day'))
      const taskIsForToday = !notToday

      if (isOverdue) return false
      if (isntReadyYet) return false
      
      if (type === 'specific') return taskIsForToday
      // if it passes here, then the task is guaranted to be periodic or weekly
      if (persistent && hasTimesBinding) return true
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
  isTaskCompleted(task) {
    if (!task.calendar) return task.completed
    const {
      type, lastComplete, tod, times,
      persistent, hasTimesBinding, manualComplete
    } = this.taskData(task, mom())
    
    if (type === 'specific') return task.completed

    /*
      if it doesn't have persistence, then it should only return a result if times === 0, cause if it's false, then the logic at line 96 will be used to figure out the completion of the task, if it does not have persistence then it should return a false or true every time
    */
    if (manualComplete.isSame(lastComplete, 'day')) return true
    if (hasTimesBinding && times === 0) return true
    if (hasTimesBinding && persistent) return times === 0
    
    if (type === 'periodic' || type === 'weekly') {
      return lastComplete.isSameOrAfter(tod, 'day')
    }

    return false
  },
  filterTasksByCompletion(tasks, notCompleted) {
    return tasks.filter(el => {
      const comp = this.isTaskCompleted(el)
      if (notCompleted) return !comp
      return comp
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
      persistent: c.persistent,
      weekDays: c.weekly,
      manualComplete: mom(c.manualComplete, 'Y-M-D'),
      times: c.times,
      hasTimesBinding: c.times !== null && c.times !== undefined
    }

    if (obj.lastComplete.isValid()) {
      if (obj.type === 'periodic')
      obj.nextEventAfterCompletion = obj.lastComplete.clone().add(obj.interval, 'day')
      else {
        obj.nextEventAfterCompletion = utilsMoment.nextWeekDay(obj.lastComplete, obj.weekDays)
      }
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
        return tasks.filter(el =>
          !this.hasCalendarBinding(el) &&
          !el.list &&
          el.tags.length === 0
        )
      }
      case 'Today': {
        return this.filterTasksByDay(tasks, mom())
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
  filterTasksByViewRendererFilterOptions(tasks, tags, list) {
    let ts = tasks
    if (tags.length > 0)
      ts = ts.filter(el => tags.every(id => el.tags.includes(id)))
    if (list)
      ts = ts.filter(el => el.list === list)
    return ts
  },
}
