
import mom from "moment"

export default {
  getFirstDayOfNextWeekMoment(initial) {
    const clone = initial.clone()
    let i = 0
    while (true) {
      if (clone.format('dddd') === 'Sunday')
        break
      clone.add(1, 'd')
      if (i > 10) break
      i++
    }
    return clone
  },
  getLastDayOfNextWeekMoment(initial) {
    const clone = this.getFirstDayOfNextWeekMoment(initial)
    return clone.add(6, 'd').clone()
  }
}
