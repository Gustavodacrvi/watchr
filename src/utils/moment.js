
import mom from 'moment'

export default {
  getFirstDayOfNextWeekMoment(initial) {
    return this.nextWeekDay(initial, 'Sunday', 'dddd')
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
  nextWeekDay(initial, weekday, format) {
    if (!format) format = 'd'
    
    const clone = initial.clone()
    let i = 0
    let possibleWeekdays = []
    if (!Array.isArray(weekday))
      possibleWeekdays.push(weekday)
    else possibleWeekdays = weekday
    const formatedWeekdays = []
    for (const week of possibleWeekdays)
      formatedWeekdays.push(mom(week, format).format('dddd'))
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
  getNextMonthlyDate(c, initial) {
    const begins = mom(c.begins, 'Y-M-D')
    const every = c.monthly.every
    const type = c.monthly.type
    const place = c.monthly.place
    
    while (true) {
      const monthDiff = initial.diff(begins.startOf('month'), 'month')
      if (monthDiff < 0 || monthDiff % every !== 0) {
        initial.add(1, 'M').startOf('month')
        continue
      }

      if (type === 'day') {
        if (place !== 'last') {
          const date = initial.date()
          if (date > place) {
            initial.add(1, 'M').startOf('month')
            continue
          } else if (date === place)
            return initial
          else {
            initial.date(place)
            continue
          }
        } else {
          initial.endOf('month')
          return initial
        }
      } else {
        if (place !== 'last') {
          const date = initial.date()

          initial.startOf('month')
          
          let num = 0
          while (num < place) {
            initial = this.nextWeekDay(initial.add(1, 'd'), type)
            
            num++
          }

          if (date > initial.date()) {
            initial.add(1, 'M').startOf('month')
            continue
          }
          
          return initial
        } else {
          initial.endOf('month')
          const weekType = initial.day()
          const target = type
          
          if (weekType === target)
            return initial

          let subtract

          const offset = 6 - weekType

          if (target > weekType)
            subtract = 7 - (offset + (target - 6))
          else
            subtract = 6 - (target + offset)
          
          initial.subtract(subtract, 'd')
          return initial
        }
      }
      break
    }
  },
  getNextEventAfterCompletionDate(c) {
    let lastComplete = mom(c.lastCompleteDate || c.begins, 'Y-M-D')
    if (lastComplete.isValid()) {
      const begins = mom(c.begins, 'Y-M-D')
      if (c.type === 'daily') {
        if (!c.lastCompleteDate)
          return mom(c.begins, 'Y-M-D')
        return lastComplete.add(c.daily, 'd')
      } else if (c.type === 'weekly') {
        while (true) {
          const week = this.nextWeekDay(lastComplete, c.weekly.days)

          const weekDiff = week.diff(begins.startOf('week'), 'weeks')
          if (weekDiff < 0 || weekDiff % c.weekly.every !== 0) {
            lastComplete.add(1, 'w').startOf('week')
            continue
          }

          return week
        }
      } else if (c.type === 'monthly') {
        return this.getNextMonthlyDate(c, lastComplete)
      } else if (c.type === 'yearly') {
        const getNext = () =>
          this.getNextMonthlyDate({
            monthly: {...c.yearly, every: 1, begins: c.begins}, begins: c.begins
          }, lastComplete.clone())
        
        while (true) {
          lastComplete = getNext()

          const yearDiff = lastComplete.diff(begins.startOf('year'), 'years')
          if (yearDiff < 0 || yearDiff % c.yearly.every !== 0) {
            lastComplete.add(1, 'y').startOf('year')
            continue
          }

          if (!c.yearly.months.includes(lastComplete.month() + 1)) {
            lastComplete.add(1, 'M').startOf('month')
            continue
          }

          return lastComplete
        }
      }
    }
    return mom(c.begins, 'Y-M-D')
  },
  getLastWeeklyEvent(c, tod) {
    return this.getLastInstanceOfaWeek(tod, c.weekly)
  },
  getFirstDayOfMonth(date) {
    return date.startOf('month')
  },
  getFirstLastDayOfMonth(date) {
    return date.endOf('month')
  },
}
