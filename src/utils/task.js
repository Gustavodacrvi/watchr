
import mom from 'moment'
import utilsMoment from './moment'
import utils from './index'

const TOD_DATE = mom().format('Y-M-D')

import { fd } from '../utils/firestore'

export default {
  isRecurringTask(calendar) {
    return calendar && calendar.type !== 'someday' && calendar.type !== 'specific' && calendar.type !== 'anytime'
  },
  taskOptions(task, vm) {

    const dispatch = vm.$store.dispatch
    const commit = vm.$store.commit
    const getters = vm.$store.getters
    const state = vm.$store.state

    const savedLists = getters['list/sortedLists']
    const userInfo = state.userInfo

    const itemGroup = state.group.groups.find(f => f.id === task.group)
    const isGroupOwner = (itemGroup && itemGroup.userId === userInfo.userId)

    const logbook = getters['task/isTaskInLogbook'](task)
    const saveTaskContent = obj => {
      dispatch('task/saveTask', {
        id: task.id,
        ...obj,
      })
    }
    const assignUser = assigned => saveTaskContent(assigned)

    const commentsPopup = () => {
      dispatch('pushPopup', {
        comp: "Comments",
        payload: {
          groupId: task.group,
          id: task.id,
        },
      })
    }
    
    const saveCalendarDate = calendar => saveTaskContent({calendar})

    const saveDate = date => {
      saveTaskContent({
        id: task.id,
        calendar: {
          type: 'specific',
          time: null,
          editDate: TOD_DATE,
          begins: TOD_DATE,

          specific: date,
        },
      })
    }

    const copyItem = () => dispatch('task/copyTask', task)

    const addPriority = priority => saveTaskContent({priority})
    
    const arr = [
      {
        name: !logbook ? 'Move to logbook' : 'Remove from logbook',
        icon: 'logbook',
        callback: () => {
          if (!logbook)
            dispatch('task/logTasks', [task.id])
          else dispatch('task/unlogTasks', [task.id])
        }
      },
      {
        type: 'optionsList',
        name: 'Deadline',
        options: [
          {
            icon: 'star',
            id: 'd',
            color: 'var(--yellow)',
            callback: () => saveTaskContent({deadline: mom().format('Y-M-D')}),
          },
          {
            icon: 'sun',
            id: 'çljk',
            color: 'var(--orange)',
            callback: () => saveTaskContent({deadline: mom().add(1, 'day').format('Y-M-D')}),
          },
          {
            icon: 'calendar',
            id: 'çljkasdf',
            color: 'var(--green)',
            callback: () => ({
              comp: 'CalendarPicker',
              content: {
                onlyDates: true,
                noTime: true,
                allowNull: true,
                callback: ({specific}) => {saveTaskContent({
                  deadline: specific,
                })}
              }
            })
          },
          {
            icon: 'bloqued',
            id: 'asdf',
            color: 'var(--red)',
            callback: () => saveTaskContent({deadline: null}),
          },
        ]
      },
      {
        type: 'optionsList',
        name: 'Defer',
        options: [
          {
            icon: 'star',
            id: 'd',
            color: 'var(--yellow)',
            callback: () => saveDate(mom().format('Y-M-D')),
          },
          {
            icon: 'sun',
            id: 'çljk',
            color: 'var(--orange)',
            callback: () => saveDate(mom().add(1, 'day').format('Y-M-D')),
          },
          {
            icon: 'layer-group',
            id: 'ds',
            color: 'var(--olive)',
            callback: () => saveCalendarDate({
              type: 'anytime',
            })
          },
          {
            icon: 'archive',
            id: 'açlkjsdffds',
            color: 'var(--brown)',
            callback: () => saveCalendarDate({
              type: 'someday',
            })
          },
          {
            icon: 'calendar',
            id: 'çljkasdf',
            color: 'var(--green)',
            callback: () => {return {
              comp: "CalendarPicker",
              content: {callback: saveCalendarDate}}},
          },
          {
            icon: 'bloqued',
            id: 'asdf',
            color: 'var(--red)',
            callback: () => saveCalendarDate(null)
          },
        ]
      },
      {
        type: 'optionsList',
        name: 'Priority',
        options: [
          {
            icon: 'priority',
            id: 'd',
            color: 'var(--fade)',
            callback: () => addPriority('')
          },
          {
            icon: 'priority',
            id: 'f',
            color: 'var(--green)',
            callback: () => addPriority('Low priority')
          },
          {
            icon: 'priority',
            id: 'j',
            color: 'var(--yellow)',
            callback: () => addPriority('Medium priority')
          },
          {
            icon: 'priority',
            id: 'l',
            color: 'var(--red)',
            callback: () => addPriority('High priority')
          },
        ],
      },
      {
        name: 'Copy task',
        icon: 'copy',
        callback: copyItem,
      },
      {
        name: 'Add tags',
        icon: 'tag',
        callback: () => utils.tagsOptions(vm, task.tags, tags => {
          saveTaskContent({tags})
        }, true)
      },
      {
        name: 'Move to list',
        icon: 'tasks',
        callback: () => utils.listsOptions(vm, saveTaskContent)
      },
      {
        name: 'Convert to list',
        icon: 'tasks',
        callback: () => {
          const existingList = savedLists.find(l => l.name === task.name)
          if (existingList)
            commit('pushToast', {
              name: 'There is already another list with this name.',
              seconds: 3,
              type: 'error',
            })
          else
            dispatch('task/convertToList', {task: task, savedLists})
        }
      },
      {
        name: 'Move to folder',
        icon: 'folder',
        callback: () => utils.folderOptions(vm, saveTaskContent)
      },
      {
        name: 'Move to group',
        icon: 'group',
        callback: () => utils.groupOptions(vm, saveTaskContent)
      },
      {
          name: 'Delete task',
          icon: 'trash',
          important: true,
          callback: () => dispatch('task/deleteTasks', [task.id])
        },
    ]
    if (task.group) {
      arr.splice(1, 0, {
        name: 'Add comments',
        icon: 'comment',
        callback: commentsPopup,
      })
      if (isGroupOwner)
        arr.splice(2, 0, getters['group/getAssigneeIconDrop'](task, uid => assignUser(uid)))
    }
    return arr
  },
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
  sortTasksByScheduleTime(tasks) {
    tasks.sort((t1, t2) => {
      const time = t => t.calendar && t.calendar.time 
      
      if (!time(t1) && !time(t2)) return 0
      if (time(t1) && !time(t2)) return -1
      if (!time(t1) && time(t2)) return 1

      const m1 = mom(time(t1), 'HH:mm')
      const m2 = mom(time(t2), 'HH:mm')

      if (m1.isSame(m2, 'minute')) return 0
      if (m1.isBefore(m2, 'minute')) return -1
      if (m1.isAfter(m2, 'minute')) return 1
    })
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
