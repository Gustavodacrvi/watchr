
import mom from 'moment/src/moment'

export default {
  getFirstDayOfNextWeekMoment(initial) {
    return this.nextWeekDay(initial, 'Sunday')
  },
  getLastDayOfNextWeekMoment(initial) {
    const clone = this.getFirstDayOfNextWeekMoment(initial)
    return clone.add(6, 'd').clone()
  },
  getLastDayOfNextMonth(initial) {
    const first = this.getFirstDayOfNextMonth(initial)
    const days = first.daysInMonth()
    first.add(days - 1, 'd')
    return first
  },
  getFirstDayOfNextMonth(initial) {
    const clone = initial.clone()
    let i = 0
    while (true) {
      if (clone.format('D') === '1')
        return clone
      clone.add(1, 'd')
      if (i > 33) break
      i++
    }
    return clone
  },
  getNextDateByMonthDay(initial, day) {
    const clone = initial.clone()
    let i = 0
    while (true) {
      if (clone.format('D') === day + '')
        return clone
      clone.add(1, 'd')
      if (i > 364) break
      i++
    }
    return clone
  },
  nextWeekDay(initial, weekday) {
    const clone = initial.clone()
    let i = 0
    let possibleWeekdays = []
    if (!Array.isArray(weekday))
      possibleWeekdays.push(weekday)
    else possibleWeekdays = weekday
    const formatedWeekdays = []
    for (const week of possibleWeekdays)
      formatedWeekdays.push(mom(week, 'ddd').format('dddd'))
    const isOnIt = (week) => {
      return formatedWeekdays.includes(week)
    }
    while (true) {
      if (isOnIt(clone.format('dddd')))
        return clone
      clone.add(1, 'd')
      if (i > 10) return clone
      i++
    }
  },
  getLastInstanceOfaWeek(initial, arrOfWeeks) {
    const weeks = []
    arrOfWeeks.forEach(w => weeks.push(mom(w, 'ddd').format('dddd')))
    const clo = initial.clone()

    let i = 0
    while (true) {
      clo.subtract(1, 'd')
      if (weeks.includes(clo.format('dddd')))
        return clo
      if (i > 10) return clo
      i++
    }
  },
  getNextCalendarPeriodicEventByMoment(initial, period, calEdit) {
    const edit = calEdit.clone()
    const diff = initial.diff(edit, 'day')
    const numberOfEvents = Math.floor(diff / period) + 1
    edit.add(numberOfEvents * period, 'day')
    return edit
  },
  getLastCalendarPeriodicEventByMoment(initial, period, calEdit) {
    const edit = calEdit.clone()
    const diff = initial.diff(edit, 'day')
    const numberOfEvents = Math.floor(diff / period)
    edit.add(numberOfEvents * period, 'day')
    return edit
  },
}
