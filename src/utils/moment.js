
import mom from "moment"

export default {
  getFirstDayOfNextWeekMoment(initial) {
    return this.nextWeekDay(initial, 'Sunday')
  },
  getLastDayOfNextWeekMoment(initial) {
    const clone = this.getFirstDayOfNextWeekMoment(initial)
    return clone.add(6, 'd').clone()
  },
  nextWeekDay(initial, weekday) {
    const clone = initial.clone()
    let i = 0
    while (true) {
      if (clone.format('dddd') === weekday)
        break
      clone.add(1, 'd')
      if (i > 10) break
      i++
    }
    return clone
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
        break
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
        break
      clone.add(1, 'd')
      if (i > 33) break
      i++
    }
    return clone
  },
}
