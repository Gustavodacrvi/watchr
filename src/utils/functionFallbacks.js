
import mom from 'moment'

import utilsTask from './task'
import { setInfo, setTag, setList, setGroup, setFolder, uid, saveCalendarOrder } from './firestore'

const isAlreadyOnAnotherList = t => t.list || t.folder || t.group
const getSpecificCalendar = specific => {
  const m = mom().format('Y-M-D')
  return {
    type: 'specific',
    editDate: m,
    begins: m,

    specific,
  }
}

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
    calendarOrder(t, force = false, specific, header) {
      const isEvening = (header && header.id === 'EVENING_SMART_VIEW')
      const c = t.calendar
      if (force || !c) {
        if (isEvening && c && c.type !== 'specific' && c.type !== 'someday' && c.type !== 'anytime') {
          c.evening = true
        } else if (force || !c) {
          const newCal = getSpecificCalendar(specific)
          if (c)
            t.calendar = {...c, ...newCal}
          else t.calendar = newCal
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
      if (force || !t.calendar) {
        const m = mom().format('Y-M-D')
        t.calendar = {
          type: 'anytime',
          editDate: m,
          begins: m,
        }
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
    Evening(t, force = false, {calendarDate}, adding = false) {
      if (force || adding || !t.calendar) {
        if (!t.calendar) {
          t.calendar = getSpecificCalendar(calendarDate)
          t.calendar.evening = true
        } else {
          t.calendar.evening = true
        }
      }
      
      return t
    },
    List(t, force = false, {listId, groupId, listTagIds = []}) {
      if (force || !isAlreadyOnAnotherList(t)) {
        t.list = listId
        t.group = groupId || null
        t.folder = null
        t.heading = null

        if (t.tags)
          t.tags = [...t.tags, ...listTagIds]
        else
          t.tags = listTagIds
        
      }
      return t
    },
    Folder(t, force = false, folderId) {
      if (force || !isAlreadyOnAnotherList(t)) {
        t.folder = folderId
        t.group = null
        t.list = null
        t.heading = null
      }
      return t
    },
    Group(t, force = false, groupId) {
      if (force || !isAlreadyOnAnotherList(t)) {
        t.folder = null
        t.list = null
        t.heading = null
        t.group = groupId
      }
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
        
        if (t.calendar)
          t.calendar.evening = false
        
        t.group = null
        t.folder = null
        t.list = null
      }
      return t
    },
    ungroupedSmartViewRoot(t, force = false) {
      if (force && t.calendar) {
        t.calendar.evening = false
      }
      return t
    },
    listRoot(t, force = false) {
      if (force) {
        t.heading = null
      }
      return t
    },
    listHeading(t, force = false, {id}) {
      if (force || (!t.heading)) {
        t.heading = id
      }
      return t
    },
    groupRoot(t, force = false, groupId) {
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
      saveCalendarOrder(b, rootState, finalIds, calendarDate, writes)
    },
    smartOrder(b, writes, {viewName, finalIds, rootState}) {
      const obj = {}
      obj[viewName] = {}
      obj[viewName].tasks = finalIds
      
      setInfo(b, {
        viewOrders: obj,
      }, rootState, writes)
    },
    smartViewLists(b, writes, {finalIds, rootState, viewName, rootGetters, listId}) {
      const list = rootGetters['list/getListsById']([listId])[0]
      let views = list.smartViewsOrders
      if (!views) views = {}
      views[viewName] = finalIds
      
      setList(b, {
        smartViewsOrders: views,
      }, listId, rootState, writes)
    },
    smartViewFolders(b, writes, {finalIds, rootState, viewName, rootGetters, folderId}) {
      const folder = rootGetters['folder/getFoldersById']([folderId])[0]
      let views = folder.smartViewsOrders
      if (!views) views = {}
      views[viewName] = finalIds

      setFolder(b, {smartViewsOrders: views}, folderId, rootState, writes)
    },
    smartViewGroups(b, writes, {finalIds, rootState, viewName, groupId}) {
      setGroup(b, {
        smartViewsOrders: {
          [viewName]: {
            [uid()]: finalIds,
          },
        }
      }, groupId, rootState, writes)
    },
    Tag(b, writes, {finalIds, tagId, rootState}) {
      setTag(b, {tasks: finalIds, subList: null}, tagId, rootState, writes)
    },
    List(b, writes, {finalIds, listId, rootState}) {
      setList(b, {tasks: finalIds}, listId, rootState, writes)
    },
    listHeading(b, writes, {listId, finalIds, headingId, rootGetters, rootState}) {
      const list = rootGetters['list/getListsById']([listId])[0]
      const heads = list.headings.slice()
      const i = heads.findIndex(el => el.id === headingId)
      heads[i].tasks = finalIds
      
      setList(b, {headings: heads}, listId, rootState, writes)
    },
    Folder(b, writes, {finalIds, folderId, rootState}) {
      setFolder(b, {tasks: finalIds}, folderId, rootState, writes)
    },
    FolderExtraView(b, writes, {finalIds, folderId, rootState}) {
      setFolder(b, {order: finalIds}, folderId, rootState, writes)
    },
    Group(b, writes, {finalIds, groupId, rootState}) {
      setGroup(b, {order: finalIds}, groupId, rootState, writes)
    },
    GroupExtraView(b, writes, {finalIds, groupId, rootState}) {
      setGroup(b, {listsOrder: finalIds}, groupId, rootState, writes)
    },
  },
}
