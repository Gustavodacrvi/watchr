
import mom from 'moment'


import utilsTask from './utilsTask'
import { fire, setInfo, setTag, setList, setGroup, setFolder } from './index'

const getBatch = fire.batch()

const isAlreadyOnAnotherList = t => t.list || t.folder || t.group

export default {
  viewFallbacks: {
    Inbox(t, force = false) {
      if (force) {
        t.group = null
        t.deadline = null
        t.calendar = null
        t.list = null
        t.folder = null
        t.tags = []
      }
      return t
    },
    calendarOrder(t, force = false, specific) {
      if (!t.calendar || force) {
        const m = mom().format('Y-M-D')
        t.calendar = {
          type: 'specific',
          editDate: m,
          begins: m,
    
          specific,
        }
      }
      return t
    },
    deadlineOrder(t, force = false, deadline) {
      if (force || !t.deadline) {
        t.deadline = deadline
      }
      return t
    },
    Someday(t, force = false) {
      if (force || !t.calendar) {
        const m = mom().format('Y-M-D')
        t.calendar = {
          type: 'someday',
          editDate: m,
          begins: m,
        }
      }
      return t
    },
    Anytime(t, force = false) {
      if (force) {
        t.calendar = null
      }
      return t
    },
    Tag(t, force = false, tagId) {
      if (t.tags)
        t.tags = [...t.tags, tagId]
      else
        t.tags = [tagId]
      return t
    },
    List(t, force = false, listId) {
      if (force || !isAlreadyOnAnotherList(t))
        t.list = listId
      return t
    },
    Folder(t, force = false, folderId) {
      if (force || !isAlreadyOnAnotherList(t))
        t.folder = folderId
      return t
    },
    Group(t, force = false, groupId) {
      if (force || !isAlreadyOnAnotherList(t))
        t.group = groupId
      return t
    },
    ListGroup(t, force = false, {groupId, listId}) {
      if (force || (!t.group && !t.list)) {
        t.group = groupId || null
        t.list = listId || null
      }
      
      if (force || !isAlreadyOnAnotherList(t))
        t.list = listId
      
      return t
    },
  },
  viewPositionFallbacks: {
    pureSmartViewRoot(t, force = false) {
      if (force) {
        t.group = null
        t.folder = null
        t.list = null
      }
      return t
    },
    listRoot(t, force = false, {listId, groupId}) {
      if (force || !isAlreadyOnAnotherList(t)) {
        t.heading = null
        t.list = listId
        t.group = groupId || null
        t.folder = null
      }
      return t
    },
    listHeading(t, force = false, headingId) {
      if (force || (!t.heading)) {
        t.heading = headingId
      }
      return t
    },
    folderRoot(t, force = false, folderId) {
      if (force || !isAlreadyOnAnotherList(t)) {
        t.folder = folderId
        t.group = null
        t.list = null
        t.heading = null
      }
      return t
    },
    folderRoot(t, force = false, groupId) {
      if (force || !isAlreadyOnAnotherList(t)) {
        t.group = groupId
        t.folder = null
        t.list = null
        t.heading = null
      }
      return t
    },
  },
  updateOrderFunctions: {
    calendarOrder(b, writes, {finalIds, calendarDate, rootState}) {

      const calendarOrders = utilsTask.getUpdatedCalendarOrders(finalIds, calendarDate, rootState)

      setInfo(b, {calendarOrders}, writes)
    },
    smartOrder(b, writes, {viewName}) {
      const obj = {}
      obj[viewName] = {}
      obj[viewName].tasks = ids
      
      setInfo(b, {
        viewOrders: obj,
      }, writes)
    },
    smartViewHeadingsListTasksOrder(b, writes, {rootState, viewName, rootGetters}) {
      const list = rootGetters['list/getListsById']([listId])[0]
      let views = list.smartViewsOrders
      if (!views) views = {}
      views[viewName] = ids
      
      setList(b, {
        smartViewsOrders: views,
      }, listId, rootState, writes)
    },
    tagOrder(b, writes, {finalIds, tagId, rootState}) {
      setTag(b, {tasks: finalIds}, tagId, rootState, writes)
    },
    saveListOrder(b, writes, {finalIds, listId, rootState}) {
      setList(b, {tasks: finalIds}, listId, rootState, writes)
    },
    saveFolderOrder(b, writes, {finalIds, folderId, rootState}) {
      setFolder(b, {order: finalIds}, folderId, rootState, writes)
    },
    saveGroupOrder(b, writes, {finalIds, groupId, rootState}) {
      setGroup(b, {order: finalIds}, groupId, rootState, writes)
    },
  },
}
