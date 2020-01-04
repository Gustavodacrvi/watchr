
import mom from 'moment'
import utilsMoment from './moment'
import utils from './index'

import { fd } from '../utils/firestore'

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
  groupTaskIds(tasks) {
    const rootTasks = []
    const folderTasksArr = []
    const listTasksArr = []

    for (const t of tasks)
      if (!t.folder && !t.list)
        rootTasks.push(t)
      else if (t.folder && !t.list)
        folderTasksArr(t)
      else listTasksArr.push(t)

    const folderTasks = {}
    for (const t of folderTasksArr) {
      if (!folderTasks[t.folder])
        folderTasks[t.folder] = []
      
      folderTasks[t.folder].push(t)
    }

    const listTasks = {}
    for (const t of listTasksArr) {
      if (!listTasks[t.list])
        listTasks[t.list] = []
      
      listTasks[t.list].push(t)
    }

    return {rootTasks, folderTasks, listTasks}
  },
  getFixedIdsFromNonFilteredAndFiltered(filtered, nonFiltered) {
    const removedIncludedIds = nonFiltered.slice().filter(id => !filtered.includes(id))
    
    let missing = []
    let i = 0
    for (const id of nonFiltered) {
      if (!removedIncludedIds.includes(id))
        missing.push(i)

      i++
    }
    i = 0
    for (const id of filtered) {
      removedIncludedIds.splice(missing[i], 0, id)
      i++
    }

    return removedIncludedIds
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
}
