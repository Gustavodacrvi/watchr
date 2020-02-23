
import mom from 'moment'

const isAlreadyOnAnotherList = t => t.list || task.folder || task.group

export default {
  viewFallbacks: {
    Inbox(task, force = false) {
      if (force) {
        task.group = null
        task.deadline = null
        task.calendar = null
        task.list = null
        task.folder = null
        task.tags = []
      }
      return task
    },
    calendarOrder(task, force = false, specific) {
      if (!task.calendar || force) {
        const m = mom().format('Y-M-D')
        task.calendar = {
          type: 'specific',
          editDate: m,
          begins: m,
    
          specific,
        }
      }
      return task
    },
    deadlineOrder(task, force = false, deadline) {
      if (!task.deadline || force) {
        task.deadline = deadline
      }
      return task
    },
    Someday(task, force = false) {
      if (!task.calendar || force) {
        task.calendar = {type: 'someday'}
      }
      return task
    },
    Anytime(task, force = false) {
      if (!task.calendar || force) {
        task.calendar = null
      }
      return task
    },
    Tag(task, force = false, tagId) {
      if (task.tags)
        task.tags = [...task.tags, tagId]
      else
        task.tags = [tagId]
      return task
    },
    List(task, force = false, listId) {
      if (force || !isAlreadyOnAnotherList(task))
        task.list = listId
      return task
    },
    Folder(task, force = false, folderId) {
      if (force || !isAlreadyOnAnotherList(task))
        task.folder = folderId
      return task
    },
    Group(task, force = false, groupId) {
      if (force || !isAlreadyOnAnotherList(task))
        task.group = groupId
      return task
    },
    ListGroup(task, force = false, {groupId, listId}) {
      if (force || (!task.group && !task.list)) {
        task.group = groupId || null
        task.list = listId || null
      }
      
      if (force || !isAlreadyOnAnotherList(task))
        task.list = listId
      
      return task
    },
  },
  viewPositionFallbacks: {
    pureSmartViewRoot(task, force = false) {
      if (force) {
        task.group = null
        task.folder = null
        task.list = null
      }
      return task
    },
    listRoot(task, force = false, {listId, groupId}) {
      if (force || !isAlreadyOnAnotherList(task)) {
        task.heading = null
        task.list = listId
        task.group = groupId || null
        task.folder = null
      }
      return task
    },
    listHeading(task, force = false, {listId, groupId, headingId}) {
      if (force || !isAlreadyOnAnotherList(task)) {
        task.list = listId
        task.group = groupId
        task.heading = headingId
        task.folder = null
      }
      return task
    },
    folderRoot(task, force = false, {folderId}) {
      if (force || !isAlreadyOnAnotherList(task)) {
        task.folder = folderId
        task.group = null
        task.list = null
        task.heading = null
      }
      return task
    },
    folderRoot(task, force = false, {groupId}) {
      if (force || !isAlreadyOnAnotherList(task)) {
        task.group = groupId
        task.folder = null
        task.list = null
        task.heading = null
      }
      return task
    },
  },
}
