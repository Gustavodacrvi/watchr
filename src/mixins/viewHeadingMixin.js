
import { mapGetters, mapState } from "vuex"

import functionFallbacks from '@/utils/functionFallbacks.js'

import mom from 'moment'

import utilsTask from "@/utils/task"

// viewName, viewType, isSmart

export default {
  methods: {
    sortArray(...args) {
      return this.$store.getters.checkMissingIdsAndSortArr(...args)
    },
  },
  computed: {
    ...mapState({
      groups: state => state.group.groups,
      userInfo: state => state.userInfo,
      userId: state => state.user.uid,
    }),
    ...mapGetters({
      lists: 'list/lists',
      folders: 'folder/folders',
      calendarDate: 'calendarDate',

      isTaskInList: 'task/isTaskInList',
      isTaskInGroup: 'task/isTaskInGroup',
      isTaskLastDeadlineDay: 'task/isTaskLastDeadlineDay',
      getEndsTodayTasks: 'task/getEndsTodayTasks',
      getFolderTaskOrderById: 'folder/getFolderTaskOrderById',
      getGroupTaskOrderById: 'group/getGroupTaskOrderById',
      getAllTasksOrderByList: 'list/getAllTasksOrderByList',
      getSpecificDayCalendarObj: 'task/getSpecificDayCalendarObj',
      isListBeginDay: 'list/isListBeginDay',
      isListLastDeadlineDay: 'list/isListLastDeadlineDay',
    }),
    
    getListFolderGroupCalendarHeadings() {
      const viewName = this.viewName

      const savedLists = this.lists
      const savedFolders = this.folders
      const savedGroups = this.groups
      
      const setOfLists = new Set()
      const setOfFolders = new Set()
      const setOfGroups = new Set()
      const isSmartOrderViewType = this.isSmartOrderViewType

      for (const t of savedLists) {
        if (!setOfLists.has(t)) {
          setOfLists.add(t)
        }
      }
      for (const f of savedFolders) {
        if (!setOfFolders.has(f)) {
          setOfFolders.add(f)
        }
      }
      for (const f of savedGroups) {
        if (!setOfGroups.has(f)) {
          setOfGroups.add(f)
        }
      }
      let lists = Array.from(setOfLists)
      lists.forEach(l => l.smartViewControllerType = 'list')
      let folders = Array.from(setOfFolders)
      folders.forEach(f => f.smartViewControllerType = 'folder')
      let groups = Array.from(setOfGroups)
      groups.forEach(f => f.smartViewControllerType = 'group')

      let currentDate = this.getCalendarOrderDate
      const getCalendarOrders = this.calendarOrders

      let calendarOrder = (getCalendarOrders[currentDate] && getCalendarOrders[currentDate].tasks) || []
      // const { rootTasks, folderTasks, listTasks } = utilsTask.groupTaskIds()

      const viewOrders = this.viewOrders

      let order
      if (isSmartOrderViewType)
        order = viewOrders[viewName] ? viewOrders[viewName].headings : []
      else {
        order = (getCalendarOrders[currentDate] && getCalendarOrders[currentDate].headings) || []
      }

      if (!order) order = []
      const headings = this.sortArray(order, [...groups, ...folders, ...lists])

      let arr = []
      for (const viewHeading of headings) {
        if (viewHeading.smartViewControllerType === 'list') {
          const list = viewHeading
          let viewTasksOrder = calendarOrder.slice()
          let tasksOrder = []

          const getAllTasksOrderByList = this.getAllTasksOrderByList

          const getSmartViewOrder = () => {
            if (list.smartViewsOrders && list.smartViewsOrders[viewName])
              return list.smartViewsOrders[viewName]
            else
              return getAllTasksOrderByList(list.id)
          }
          
          if (isSmartOrderViewType)
            tasksOrder = getSmartViewOrder()
          else {
            const taskIdsFromList = getAllTasksOrderByList(list.id)

            let found = false
            for (const id of viewTasksOrder)
              if (taskIdsFromList.includes(id)) {
                found = true
                break
              }

            if (found) tasksOrder = viewTasksOrder
            else tasksOrder = taskIdsFromList
          }
          if (!isSmartOrderViewType)
            viewTasksOrder = utilsTask.concatArraysRemovingOldEls(viewTasksOrder, tasksOrder)
          else viewTasksOrder = tasksOrder.slice()
          
          const saveOrder = isSmartOrderViewType ?
            functionFallbacks.updateOrderFunctions.smartViewLists
             : functionFallbacks.updateOrderFunctions.calendarOrder

          const isTaskInList = this.isTaskInList

          const filterFunction = task => isTaskInList(task, list.id)

          arr.push({
            name: list.name,
            allowEdit: true,
            hideListName: true,
            hideFolderName: true,
            showHeadingName: true,
            showHeading: false,
            id: list.id,
            
            onEdit: tasks => name => {
              this.$store.dispatch('list/saveList', {
                name, id: list.id,
              })
            },
            sort: this.sortArray,
            order: viewTasksOrder,
            progress: () => this.$store.getters['list/pieProgress'](list.id),
            filter: filterFunction,
            options: tasks => [
              {
                name: 'Change date',
                icon: 'calendar',
                callback: () => ({
                  comp: "CalendarPicker",
                  content: {callback: (calendar) => this.$store.dispatch('task/saveTasksById', {
                    ids: tasks.map(el => el.id),
                    task: {calendar},
                  })}
                })
              }
            ],
            fallbackFunctionData: () => ({
              scheduleOrder: viewTasksOrder,
              calendarDate: currentDate,
              viewName,
              listId: list.id,
            }),
            updateViewIds: saveOrder,
            fallbackItem: (t, f) => functionFallbacks.viewFallbacks.List(t, f, {listId: list.id, group: list.group, list: list.tags}),
            itemModelFallback: {
              list: list.id,
              group: list.group || null,
            },
          })
        } else if (viewHeading.smartViewControllerType === 'folder') {
          const folder = viewHeading
          let tasksOrder = []
          let viewTasksOrder = calendarOrder.slice()

          const getFolderTaskOrderById = this.getFolderTaskOrderById
          
          const getSmartViewOrder = () => {
            if (folder.smartViewsOrders && folder.smartViewsOrders[viewName])
              return folder.smartViewsOrders[viewName]
            else
              return getFolderTaskOrderById(folder.id)
          }
          
          if (isSmartOrderViewType)
            tasksOrder = getSmartViewOrder()
          else {
            const taskIdsFromFolder = getFolderTaskOrderById(folder.id)

            let found = false
            for (const id of viewTasksOrder)
              if (taskIdsFromFolder.includes(id)) {
                found = true
                break
              }

            if (found) tasksOrder = viewTasksOrder
            else tasksOrder = taskIdsFromFolder
          }
          if (!isSmartOrderViewType)
            viewTasksOrder = utilsTask.concatArraysRemovingOldEls(viewTasksOrder, tasksOrder)
          else viewTasksOrder = tasksOrder.slice()
          
          const saveOrder = isSmartOrderViewType ?
            functionFallbacks.updateOrderFunctions.smartViewFolders
             : functionFallbacks.updateOrderFunctions.calendarOrder

          const isTaskInFolder = this.isTaskInFolder
             
          const filterFunction = task => isTaskInFolder(task, folder.id)

          arr.push({
            name: folder.name,
            allowEdit: true,
            hideFolderName: true,
            showHeadingName: true,
            showHeading: false,
            icon: 'folder',
            id: folder.id,

            onEdit: tasks => name => {
              this.$store.dispatch('folder/saveFolder', {
                name, id: folder.id,
              })
            },
            sort: this.sortArray,
            order: viewTasksOrder,
            filter: filterFunction,
            options: tasks => [
              {
                name: 'Change date',
                icon: 'calendar',
                callback: () => ({
                  comp: "CalendarPicker",
                  content: {callback: (calendar) => this.$store.dispatch('task/saveTasksById', {
                    ids: tasks.map(el => el.id),
                    task: {calendar},
                  })}
                })
              }
            ],
            fallbackFunctionData: () => ({
              calendarDate: currentDate,
              scheduleOrder: viewTasksOrder,
              viewName,
              folderId: folder.id,
            }),
            updateViewIds: saveOrder,
            fallbackItem: (t, f) => functionFallbacks.viewFallbacks.Folder(t, f, folder.id),
            itemModelFallback: {folder: folder.id},
          })
        } else if (viewHeading.smartViewControllerType === 'group') {
          const group = viewHeading
          let viewTasksOrder = calendarOrder.slice()
          let tasksOrder = []
          const getSmartViewOrder = () => {
            if (group.smartViewsOrders && group.smartViewsOrders[viewName] && group.smartViewsOrders[viewName][this.userId])
              return group.smartViewsOrders[viewName][this.userId]
            else
              return this.getGroupTaskOrderById(group.id)
          }
          
          if (isSmartOrderViewType)
            tasksOrder = getSmartViewOrder()
          else {
            const taskIdsFromGroup = this.getGroupTaskOrderById(group.id)

            let found = false
            for (const id of viewTasksOrder)
              if (taskIdsFromGroup.includes(id)) {
                found = true
                break
              }

            if (found) tasksOrder = viewTasksOrder
            else tasksOrder = taskIdsFromGroup
          }
          if (!isSmartOrderViewType)
            viewTasksOrder = utilsTask.concatArraysRemovingOldEls(viewTasksOrder, tasksOrder)
          else viewTasksOrder = tasksOrder.slice()
          
          const saveOrder = isSmartOrderViewType ?
            functionFallbacks.updateOrderFunctions.smartViewGroups
             : functionFallbacks.updateOrderFunctions.calendarOrder

          const isTaskInGroup = this.isTaskInGroup
             
          const filterFunction = task => isTaskInGroup(task, group.id)

          arr.push({
            name: group.name,
            allowEdit: true,
            hideGroupName: true,
            showHeadingName: true,
            showHeading: false,
            icon: 'group',
            id: group.id,

            onEdit: tasks => name => {
              this.$store.dispatch('group/saveGroup', {
                name, id: group.id,
              })
            },
            sort: this.sortArray,
            order: viewTasksOrder,
            filter: filterFunction,
            options: tasks => [
              {
                name: 'Change date',
                icon: 'calendar',
                callback: () => ({
                  comp: "CalendarPicker",
                  content: {callback: (calendar) => this.$store.dispatch('task/saveTasksById', {
                    ids: tasks.map(el => el.id),
                    task: {calendar},
                  })}
                })
              }
            ],
            fallbackFunctionData: () => ({
              calendarDate: currentDate,
              scheduleOrder: viewTasksOrder,
              viewName,
              groupId: group.id,
            }),
            updateViewIds: saveOrder,
            fallbackItem: (t, f) => functionFallbacks.viewFallbacks.Group(t, f, group.id),
            itemModelFallback: {group: group.id},
          })
        }
      }

      return arr
    },
    getListHeadingsByView() {
      let arr = []

      const isCalendarOrderViewType = this.isCalendarOrderViewType

      if (!(isCalendarOrderViewType && this.ungroupTasksInHeadings)) 
        arr = this.getListFolderGroupCalendarHeadings

      if (isCalendarOrderViewType) {
        const calendarDate = this.getCalendarOrderDate
        let scheduleOrder = this.getCurrentScheduleTasksOrder.slice()

      if (this.hasEndsTodayTasks)
        arr.push({
          name: 'Evening',
          id: 'EVENING_SMART_VIEW',
          color: 'var(--dark-purple)',
          icon: 'moon',
          showHeading: true,

          sort: this.sortArray,
          filter: t => t.calendar && t.calendar.evening,
          fallbackFunctionData: () => ({
            viewName: this.viewName,
            scheduleOrder,
            calendarDate,
          }),
          order: scheduleOrder,
          updateViewIds: functionFallbacks.updateOrderFunctions.calendarOrder,
          fallbackItem: (t, f, c, p) => functionFallbacks.viewFallbacks.Evening(t, f, {calendarDate}, p),
          itemModelFallback: {
            calendar: {
              ...this.getSpecificDayCalendarObj(calendarDate),
              evening: true,
            },
          },
        })
      }

      if (!this.isSmartOrderViewType)
        arr = [...arr, ...this.lastDayDeadlineItemsHeadings]
      else
        arr = [...arr, ...this.smartOrderListHeadings]

      return arr
    },
    smartOrderListHeadings() {

      const viewName = this.viewName

      const arr = []

      const viewOrders = this.viewOrders

      const itemsOrder = (viewOrders[viewName] && viewOrders[viewName].lists) || []

      const isListInView = this.isListInView

      const filterFunction = l => isListInView(l, viewName)

      let color = this.$store.getters.sidebarElements.find(el => el.name === viewName).color

      arr.push({
        color,
        name: 'Lists',
        id: 'LISTS_SMART_VIEW_RODER',
        icon: 'tasks',
        showHeading: true,

        listType: true,
        directFiltering: true,

        comp: 'List',
        editComp: 'List',
        itemPlaceholder: 'List name...',
        
        sort: this.sortArray,
        order: itemsOrder,
        filter: filterFunction,
        options: lists => [],
        fallbackItem: (list, force) => {
          return list
        },
        fallbackFunctionData: () => ({
          calendarDate: date,
          scheduleOrder: itemsOrder,
        }),
        updateViewIds: functionFallbacks.updateOrderFunctions.calendarOrder,
      })

      return arr
    },
    getCurrentCalendarDateSchedule() {
      const order = this.calendarOrders
      const date = this.getCalendarOrderDate
      return order[date]
    },
    getCurrentScheduleTasksOrder() {
      const order = this.getCurrentCalendarDateSchedule
      return (order && order.tasks) || []
    },
    lastDayDeadlineItemsHeadings() {

      const arr = []
      const itemsOrder = this.getCurrentScheduleTasksOrder
      const dispatch = this.$store.dispatch

      const date = this.getCalendarOrderDate
      const isListLastDeadlineDay = this.isListLastDeadlineDay
      if (this.hasEndsTodayLists) {
        const filterFunction = l => isListLastDeadlineDay(l, date)

        arr.push({
          name: 'Ends today lists',
          id: 'LAST_DEADLINE_DAY_LIST',
          icon: 'deadline',
          color: 'var(--red)',

          listType: true,
          disableDeadlineStr: true,
          directFiltering: true,

          comp: 'List',
          editComp: 'List',
          itemPlaceholder: 'List name...',
          
          sort: this.sortArray,
          order: itemsOrder,
          filter: filterFunction,
          options: lists => [{
            name: 'Change deadline',
            icon: 'deadline',
            callback: () => ({
              comp: 'CalendarPicker',
              content: {
                onlyDates: true,
                noTime: true,
                allowNull: true,
                callback: ({specific}) => {
                  dispatch('list/saveListsById', {
                    ids: lists.map(el => el.id),
                    list: {
                      deadline: specific,
                    },
                  })
                }
              }
            })
          }],
          fallbackItem: (list, force) => {
            if (force || !list.deadline)
              list.deadline = mom().format('Y-M-D')
            return list
          },
          fallbackFunctionData: () => ({
            calendarDate: date,
            scheduleOrder: itemsOrder,
          }),
          updateViewIds: functionFallbacks.updateOrderFunctions.calendarOrder,
        })
      }

      const isListBeginDay = this.isListBeginDay
      if (this.hasBeginsTodayLists) {
        const filterFunction = l => isListBeginDay(l, date)

        arr.push({
          name: 'Begins today lists',
          id: 'BEGINDS_TODAY_LISTS',
          icon: 'calendar',

          listType: true,
          directFiltering: true,

          comp: 'List',
          editComp: 'List',
          itemPlaceholder: 'List name...',
          
          sort: this.sortArray,
          order: itemsOrder,
          filter: filterFunction,
          options: lists => [{
            name: 'Change date',
            icon: 'calendar',
            callback: () => ({
              comp: 'CalendarPicker',
              content: {
                callback: (calendar) => {
                  dispatch('list/saveListsById', {
                    ids: lists.map(el => el.id),
                    list: {
                      calendar,
                    },
                  })
                }
              }
            })
          }],
          fallbackItem: (list, force) => {
            if (force || !list.calendar) {
              list.calendar = {
                type: 'specific',
                editDate: mom().format('Y-M-D'),
                begins: mom().format('Y-M-D'),
          
                specific: date,
              }
            }
            return list
          },
          fallbackFunctionData: () => ({
            calendarDate: date,
            scheduleOrder: itemsOrder,
          }),
          updateViewIds: functionFallbacks.updateOrderFunctions.calendarOrder,
        })
      }
      const isTaskLastDeadlineDay = this.isTaskLastDeadlineDay
      if (this.hasEndsTodayTasks) {
        const filterFunction = l => isTaskLastDeadlineDay(l, date)

        arr.push({
          name: 'Ends today tasks',
          id: 'LAST_DEADLIEN_DAY_TASKS',
          icon: 'deadline',
          color: 'var(--red)',

          directFiltering: true,
          
          sort: this.sortArray,
          order: itemsOrder,
          filter: filterFunction,
          options: tasks => [{
            name: 'Change deadline',
            icon: 'deadline',
            callback: () => ({
              comp: 'CalendarPicker',
              content: {
                onlyDates: true,
                noTime: true,
                allowNull: true,
                callback: ({specific}) => {
                  dispatch('task/saveTasksById', {
                    ids: tasks.map(el => el.id),
                    task: {
                      deadline: specific,
                    },
                  })
                }
              }
            })
          }],
          fallbackItem: (task, force) => {
            if (force || !task.deadline)
              task.deadline = mom().format('Y-M-D')
            return task
          },
          fallbackFunctionData: () => ({
            calendarDate: date,
            scheduleOrder: itemsOrder,
          }),
          updateViewIds: functionFallbacks.updateOrderFunctions.calendarOrder,
        })
      }
      
      return arr
    },
    
    isCalendarOrderViewType() {
      if (this.viewType === 'calendar')
        return true
      const n = this.viewName
      return this.viewType === 'list' && this.isSmart && 
        (n === 'Today' || n === 'Tomorrow' || n === 'Calendar')
    },
    hasEndsTodayTasks() {
      return this.getEndsTodayTasks(this.getCalendarOrderDate).length > 0
    },
    ungroupTasksInHeadings() {
      return this.userInfo.ungroupTasksInHeadings
    },
    viewOrders() {
      const info = this.userInfo
      if (info && info.viewOrders) return info.viewOrders
      return {}
    },
    calendarOrders() {
      const info = this.userInfo
      if (info && info.calendarOrders)
        return info.calendarOrders
      return {}
    },
    isSmartOrderViewType() {
      const n = this.viewName
      return this.viewType === 'list' && this.isSmart &&
        (n === 'Someday' || n === 'Anytime' || n === 'Inbox' || n === 'Assigned to me')
    },
    getCalendarOrderDate() {
      if (this.calendarDate)
        return this.calendarDate
      let currentDate = mom()
      const n = this.viewName
      if (n !== 'Tomorrow' && n !== 'Today' && n !== 'Calendar')
        return null
      if (n === 'Tomorrow')
        currentDate.add(1, 'd')

      currentDate = currentDate.format('Y-M-D')

      return currentDate
    },
  },
}
