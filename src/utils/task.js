
import mom from 'moment'
import utilsMoment from './moment'
import utils from './index'

import { fd } from '../utils/firestore'

export default {
  isTaskInLogbook(task) {
    const { logbook, calendar } = task

    const c = calendar

    if (!c || c.type === 'specific' || c.type === 'someday' || c.type === 'someday' || c.type === 'anytime')
      return logbook
    
    if (c.ends) {
      if (c.ends.type === 'on date' && TODAY_MOM.isAfter(mom(c.ends.onDate, 'Y-M-D'), 'day'))
        return true
      else if (c.ends.times === 0)
        return true
    }
  },
  isTaskCompleted(task, moment, compareDate) {
    let isCompleted = utils.isItemCompleted(task, moment)
    if (compareDate) {
      if (!task.completeDate) return false
      const taskCompleteDate = mom(task.completeDate, 'Y-M-D')
      const compare = mom(compareDate, 'Y-M-D')
      return isCompleted && taskCompleteDate.isSameOrAfter(compare, 'day')
    }
    return isCompleted
  },
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
  concatArraysRemovingOldEls(arr, toMerge) {
    const newArr = [...arr,...toMerge]
    const set = new Set()
    const filtered = newArr.filter(id => {
      if (!set.has(id)) {
        set.add(id)
        return true
      }
    })
    const toEnd = filtered.filter(id => !toMerge.includes(id))
    return [...toEnd, ...toMerge]
  },
  getFixedIdsFromNonFilteredAndFiltered(filtered, nonFiltered) {

    const removed = nonFiltered.filter(id => !filtered.includes(id))
    let firstNewIdIndex = null
    let j = 0
    const newIds = filtered.filter(id => {
      if (!nonFiltered.includes(id)) {
        if (firstNewIdIndex === null)
          firstNewIdIndex = j
        return true
      }
      j++
    })
    
    let missing = []
    let i = 0
    for (const id of nonFiltered) {
      if (!removed.includes(id))
        missing.push(i)

      i++
    }
    i = 0
    for (const id of filtered) {
      if (!newIds.includes(id)) {
        removed.splice(missing[i], 0, id)
        i++
      }
    }

    if (newIds.length > 0)
      removed.splice(firstNewIdIndex, 0, ...newIds)

    return removed
  },
  getUpdatedCalendarOrders(ids, date, rootState, property = 'tasks') {
    const calendarOrders = { [date]: { [property]: ids } }

    const orders = rootState.userInfo.calendarOrders || {}

    const savedKeys = Object.keys(orders)
    const keysToRemove = []
    const tod = mom()
    for (const key of savedKeys)
      if (mom(key, 'Y-M-D').isBefore(tod, 'day'))
        keysToRemove.push(key)

    for (const key of keysToRemove)
      calendarOrders[key] = fd().delete()

    return calendarOrders
  },
  parsePriorityFromString(n) {
    const pri = priority => {
      const obj = {
        'Low priority': ' !l',
        'Medium priority': ' !m',
        'High priority': ' !h',
      }
      return {
        priority,
        str: n.replace(obj[priority], ''),
      }
    }
    if (n.includes(' !l')) return pri('Low priority')
    if (n.includes(' !m')) return pri('Medium priority')
    if (n.includes(' !h')) return pri('High priority')
    if (n.includes(' !n'))
      return {
        priority: '',
        str: n.replace(' !no', ''),
      }
    return {
      priority: null,
      str: n,
    }
  },
}
