<template>
  <ViewRenderer
    v-bind="$props"

    :width='width'

    :prefix='prefix'
    :viewName='viewName'
    :viewType='viewType'

    :icon='icon'
    :showEmptyHeadings='showEmptyHeadings'
    :updateHeadingIds='updateHeadingIds'
    :savedSchedule='savedSchedule'
    :headingEditOptions='headingEditOptions'
    :headerOptions='headerOptions'
    :notes='getViewNotes'
    :progress='getPieProgress'
    :headings='headings'
    :headingsOrder='headingsOrder'
    :showAllHeadingsItems='showAllHeadingsItems'
    :rootFallbackItem='rootFallbackItem'
    :getCalendarOrderDate='getCalendarOrderDate'
    :removeListHandlerWhenThereArentLists='removeListHandlerWhenThereArentLists'

    :sidebarHided='sidebarHided'

    :mainFilter='mainFilter'
    :disableRootActions='disableRootActions'
    :rootFilter='rootFilter'
    :tasksOrder='tasksOrder'
    :onSortableAdd='onSortableAdd'
    :viewNameValue='viewNameValue'
    :headerInfo='headerInfo'
    :saveHeaderContent='saveHeaderContent'
    :mainFallbackItem='mainFallbackItem'
    :showHeading='showHeading'
    :itemCompletionCompareDate='itemCompletionCompareDate'
    :configFilterOptions='configFilterOptions'
    :smartComponent='smartComponent'
    :onSmartComponentUpdate='onSmartComponentUpdate'
    :viewComponent='viewComponent'
    :isListType='isListType'
    :viewItem='viewItem'
    :extraListView='extraListView'
    :removeHeaderTag='removeHeaderTag'
    :saveHeaderName='saveHeaderName'

    @save-schedule='saveSchedule'
    @add-task='addTask'
    @add-heading='addHeading'
    @update-ids='updateIds'
    @sidebar='sidebar'
    
    @slide='slide'
    @show-completed='v => showCompleted = v'
  />
</template>

<script>

import ViewRendererVue from './../ViewRenderer.vue'
import { mapState, mapGetters, mapMutations } from 'vuex'

import utilsTask from '@/utils/task'
import utilsList from '@/utils/list'
import folderUtils from '@/utils/folder'
import utils from '@/utils/'

import { pipeBooleanFilters } from '@/utils/memo'

import mom from 'moment'

import mixins from './controlerModules'
import mainMixin from './mixins/controler.js'

export default {
  mixins: [...mixins, mainMixin],
  props: ['isSmart', 'viewName', 'viewType', 'width', 'sidebarHided'],
  components: {
    ViewRenderer: ViewRendererVue,
  },
  data() {
    return {
      showCompleted: false,
      calendarDate: null,
    }
  },
  methods: {
    getCalObjectByView(viewName, cal) {
      if (this.viewName === 'Today')
        return this.getSpecificDayCalendarObj(mom(), cal)
      if (this.viewName === 'Tomorrow')
        return this.getSpecificDayCalendarObj(mom().add(1, 'day'), cal)
      if (this.viewName === 'Someday')
        return {type: 'someday'}
    },
    slide(num) {
      this.$store.commit('slide', num)
    },
    sidebar() {
      this.$emit('sidebar')
    },
    sortArray(...args) {
      return this.$store.getters.checkMissingIdsAndSortArr(...args)
    },
    getCalendarOrderByDate(date) {
      const c = this.calendarOrders
      return (c[date] && c[date].tasks) || []
    },
    getWholeYearCalendarHeadings(o = {}) {
      const arr = []
      const sort = ([], tasks) => utilsTask.sortTasksByTaskDate(tasks)
      const TOD_STR = mom().format('Y-M-D')
      const dispatch = this.$store.dispatch

      // this month
      const now = mom()
      arr.push({
        name: 'This month',
        disableSortableMount: true,
        calendarEvents: [now.startOf('month').format('Y-M-D'), now.endOf('month').format('Y-M-D')],
        sort,
        filter: task => this.isTaskInPeriod(task, TOD_STR, 'month', true),
        id: 'this month',

        ...(o['This month'] || {}),
      })
      now.add(1, 'month')

      for (let monthNum = now.month(); monthNum < 12; monthNum++) {
        const name = now.format('MMMM')

        arr.push({
          name: now.format('MMMM'),
          id: name,
          calendarEvents: [now.startOf('month').format('Y-M-D'), now.endOf('month').format('Y-M-D')],
          showHeading: true,
          disableSortableMount: true,

          sort,
          ...(o['months'] || {}),
          filter: (o['months'] && o['months'].filter) ? t => o['months'].filter(t, monthNum) : t => this.isTaskInMonth(t, monthNum),
        })

        now.add(1, 'month')
      }
      
      // next years
      arr.push({
        name: 'Upcoming years',
        disableSortableMount: true,
        sort,
        filter: t => this.isTaskInOneYear(t),
        id: 'nextYears',

        ...(o['Upcoming years'] || {}),
      })
      return arr
    },
    getCalendarOrderTypeHeadings(date, o = {}) {
      const dispatch = this.$store.dispatch

      const calObj = this.getSpecificDayCalendarObj
      
      return {
        ...o,
        name: o.name ? o.name : date,
        id: date,
        calendarEvents: o.calendarEvents ? o.calendarEvents : date,
        showHeading: true,
        dateType: true,

        sort: o.sort ? o.sort : this.sortArray,
        order: o.order ? o.order : this.getCalendarOrderByDate(date),

        filter: o.filter ? o.filter : task => this.isTaskShowingOnDate(task, date, true),
        fallbackItem: o.fallbackItem ? o.fallbackItem : task => {
          if (!task.calendar)
            task.calendar = calObj(date)
          return task
        },
        onAddItem: o.onAddItem ? o.onAddItem : obj => {
          dispatch('list/addTaskByIndexCalendarOrder', {
            ...obj, date,
          })
        },
        onSortableAdd: o.onSortableAdd ? o.onSortableAdd : (evt, taskIds, type, ids) => {
          dispatch('task/saveTasksById', {
            ids: taskIds,
            task: {calendar: calObj(date)},
          })
        },
        updateIds: o.updateIds ? o.updateIds : ids => {
          dispatch('task/saveCalendarOrder', {ids, date})
        }
      }
    },
  },
  computed: {
    ...mapState({
      userInfo: state => state.userInfo,
      groups: state => state.group.groups,
      userId: state => state.user.uid,
    }),
    ...mapMutations(['pushToast']),
    ...mapGetters({
      lists: 'list/lists',
      folders: 'folder/folders',
      tags: 'tag/tags',
      logTasks: 'task/logTasks',
      getSpecificDayCalendarObj: 'task/getSpecificDayCalendarObj',
      tasks: 'task/tasks',
      isDesktop: 'isDesktop',
      getAllTasksOrderByList: 'list/getAllTasksOrderByList',
      getFolderTaskOrderById: 'folder/getFolderTaskOrderById',
      getGroupTaskOrderById: 'group/getGroupTaskOrderById',
      getCalendarOrderSmartViewListsOrder: 'list/getCalendarOrderSmartViewListsOrder',
      isTaskInList: 'task/isTaskInList',
      isTaskDeadlineInMonth: 'task/isTaskDeadlineInMonth',
      getLaterLists: 'list/getLaterLists',
      isLaterList: 'list/isLaterList',
      isTaskLastDeadlineDay: 'task/isTaskLastDeadlineDay',
      getEndsTodayLists: 'list/getEndsTodayLists',
      getBeginsTodayLists: 'list/getBeginsTodayLists',
      isListLastDeadlineDay: 'list/isListLastDeadlineDay',
      isListBeginDay: 'list/isListBeginDay',
      getEndsTodayTasks: 'task/getEndsTodayTasks',
      isRecurringTask: 'task/isRecurringTask',
      wasTaskLoggedLastWeek: 'task/wasTaskLoggedLastWeek',
      getOverdueTasks: 'task/getOverdueTasks',
      wasTaskLoggedInMonth: 'task/wasTaskLoggedInMonth',
      isOldTask: 'task/isOldTask',
      isTaskInSevenDays: 'task/isTaskInSevenDays',
      isTaskInFolder: 'task/isTaskInFolder',
      isTaskInListRoot: 'task/isTaskInListRoot',
      isTaskInPeriod: 'task/isTaskInPeriod',
      isTaskInbox: 'task/isTaskInbox',
      hasTaskBeenCompletedOnDate: 'task/hasTaskBeenCompletedOnDate',
      isTaskShowingOnDate: 'task/isTaskShowingOnDate',
      isTaskInOneMonth: 'task/isTaskInOneMonth',
      isTaskWeekly: 'task/isTaskWeekly',
      isTaskInOneYear: 'task/isTaskInOneYear',
      isTaskInMonth: 'task/isTaskInMonth',
      isTaskDeadlineThisMonth: 'task/isTaskDeadlineThisMonth',
      isTaskDeadlineInOneYear: 'task/isTaskDeadlineInOneYear',
      isTaskCompleted: 'task/isTaskCompleted',
      isRecurringList: 'list/isRecurringList',
      isTaskInView: 'task/isTaskInView',
      isListInView: 'list/isListInView',
      doesTaskPassInclusiveTags: 'task/doesTaskPassInclusiveTags',
      doesTaskIncludeText: 'task/doesTaskIncludeText',
      isTaskInHeading: 'task/isTaskInHeading',
      isTaskInGroup: 'task/isTaskInGroup',
      filterTasksByCompletionDate: 'task/filterTasksByCompletionDate',
      getTagsById: 'tag/getTagsById',
      getListsById: 'list/getListsById',
      getListDeadlineDaysLeftStr: 'list/getListDeadlineDaysLeftStr',
      getListByName: 'list/getListByName',
      getSpecificDayCalendarObj: 'task/getSpecificDayCalendarObj',
    }),
    getListHeadingsByView() {
      const viewName = this.viewName
      const savedLists = this.lists
      const savedFolders = this.folders
      const savedGroups = this.groups
      const setOfLists = new Set()
      const setOfFolders = new Set()
      const setOfGroups = new Set()
      const isSmartOrderViewType = (viewName === 'Someday' || viewName === 'Anytime')

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

      let currentDate = mom()
      if (viewName === 'Tomorrow')
        currentDate.add(1, 'd')

      currentDate = currentDate.format('Y-M-D')

      if (viewName === 'Calendar')
        currentDate = this.calendarDate

      let calendarOrder = (this.calendarOrders[currentDate] && this.calendarOrders[currentDate].tasks) || []
      // const { rootTasks, folderTasks, listTasks } = utilsTask.groupTaskIds()

      let order
      if (isSmartOrderViewType)
        order = this.viewOrders[viewName] ? this.viewOrders[viewName].headings : []
      else {
        order = (this.calendarOrders[currentDate] && this.calendarOrders[currentDate].headings) || []
      }

      if (!order) order = []
      const headings = this.sortArray(order, [...groups, ...folders, ...lists])

      let arr = []
      for (const viewHeading of headings) {
        if (viewHeading.smartViewControllerType === 'list') {
          const list = viewHeading
          let viewTasksOrder = calendarOrder.slice()
          let tasksOrder = []

          const getSmartViewOrder = () => {
            if (list.smartViewsOrders && list.smartViewsOrders[viewName])
              return list.smartViewsOrders[viewName]
            else
              return this.getAllTasksOrderByList(list.id)
          }
          
          if (isSmartOrderViewType)
            tasksOrder = getSmartViewOrder()
          else {
            const taskIdsFromList = this.getAllTasksOrderByList(list.id)

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
          
          const saveOrder = ids => {
            if (isSmartOrderViewType) {
              this.$store.dispatch('list/saveSmartViewHeadingTasksOrder', {
                ids, listId: list.id, smartView: viewName,
              })
            } else {
              this.$store.dispatch('task/saveCalendarOrder', {
                ids: utilsTask.concatArraysRemovingOldEls(viewTasksOrder, ids),
                date: currentDate,
              })
            }
          }

          const filterFunction = task => this.isTaskInList(task, list.id)

          arr.push({
            name: list.name,
            allowEdit: true,
            hideListName: true,
            hideFolderName: true,
            showHeadingName: true,
            id: list.id,
            
            onEdit: tasks => name => {
              this.$store.dispatch('list/saveList', {
                name, id: list.id,
              })
            },
            sort: this.sortArray,
            order: viewTasksOrder,
            progress: () => this.$store.getters['list/pieProgress'](this.$store.getters['task/allTasks'], list.id, this.isTaskCompleted),
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
            updateIds: saveOrder,
            fallbackItem: (task, force) => {
              if (force || (!task.group && !task.list)) {
                task.group = list.group || null
                task.list = list.id || null
              }
              
              if (force || (!task.list && !task.folder && !task.group))
                task.list = list.id
              
              return task
            },
            onAddItem: obj => {
              if (isSmartOrderViewType)
                this.$store.dispatch('list/addTaskByIndexSmartViewList', {
                  ...obj, listId: list.id, viewName: viewName,
                })
              else
                this.$store.dispatch('list/addTaskByIndexCalendarOrder', {
                  ...obj,
                  ids: utilsTask.concatArraysRemovingOldEls(viewTasksOrder, obj.ids),
                  date: currentDate,
                })
            },
            onSortableAdd: (evt, taskIds, type, ids) => {
              if (isSmartOrderViewType)
                this.$store.dispatch('list/moveTasksToList', {
                  taskIds, ids, listId: list.id, smartView: viewName,
                })
              else
                this.$store.dispatch('list/moveTasksToListCalendarOrder', {
                  taskIds, ids, date: currentDate, listId: list.id,
                  ids: utilsTask.concatArraysRemovingOldEls(viewTasksOrder, ids)
                })
            }
          })
        } else if (viewHeading.smartViewControllerType === 'folder') {
          const folder = viewHeading
          let tasksOrder = []
          let viewTasksOrder = calendarOrder.slice()
          const getSmartViewOrder = () => {
            if (folder.smartViewsOrders && folder.smartViewsOrders[viewName])
              return folder.smartViewsOrders[viewName]
            else
              return this.getFolderTaskOrderById(folder.id)
          }
          
          if (isSmartOrderViewType)
            tasksOrder = getSmartViewOrder()
          else {
            const taskIdsFromFolder = this.getFolderTaskOrderById(folder.id)

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
          
          const saveOrder = ids => {
            if (isSmartOrderViewType)
              this.$store.dispatch('folder/saveSmartViewHeadingTasksOrder', {
                ids, folderId: folder.id, smartView: viewName,
              })
            else
              this.$store.dispatch('task/saveCalendarOrder', {
                ids: utilsTask.concatArraysRemovingOldEls(viewTasksOrder, ids),
                date: currentDate,
              })
          }

          const filterFunction = task => this.isTaskInFolder(task, folder.id)

          arr.push({
            name: folder.name,
            allowEdit: true,
            hideFolderName: true,
            showHeadingName: true,
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
            updateIds: saveOrder,
            fallbackItem: (task, force) => {
              if (force || (!task.list && !task.folder && !task.group))
                task.folder = folder.id
              return task
            },
            onAddItem: obj => {
              if (isSmartOrderViewType)
                this.$store.dispatch('list/addTaskByIndexSmartViewFolder', {
                  ...obj, folderId: folder.id, viewName: viewName,
                })
              else
                this.$store.dispatch('list/addTaskByIndexCalendarOrder', {
                  ...obj,
                  ids: utilsTask.concatArraysRemovingOldEls(viewTasksOrder, obj.ids),
                  date: currentDate,
                })
            },
            onSortableAdd: (evt, taskIds, type, ids) => {
              if (isSmartOrderViewType)
                this.$store.dispatch('folder/moveTasksToFolder', {
                  taskIds, ids, folderId: folder.id, smartView: viewName,
                })
              else
                this.$store.dispatch('folder/moveTasksToFolderCalendarOrder', {
                  taskIds, ids, date: currentDate, folderId: folder.id,
                  ids: utilsTask.concatArraysRemovingOldEls(viewTasksOrder, ids),
                })
            }
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
          
          const saveOrder = ids => {
            if (isSmartOrderViewType)
              this.$store.dispatch('group/saveSmartViewHeadingTasksOrder', {
                ids, groupId: group.id, viewName,
              })
            else
              this.$store.dispatch('task/saveCalendarOrder', {
                ids: utilsTask.concatArraysRemovingOldEls(viewTasksOrder, ids),
                date: currentDate,
              })
          }

          const filterFunction = task => this.isTaskInGroup(task, group.id)

          arr.push({
            name: group.name,
            allowEdit: true,
            hideGroupName: true,
            showHeadingName: true,
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
            updateIds: saveOrder,
            fallbackItem: (task, force) => {
              if (force || (!task.list && !task.folder && !task.group))
                task.group = group.id
              return task
            },
            onAddItem: obj => {
              if (isSmartOrderViewType)
                this.$store.dispatch('list/addTaskByIndexSmartViewGroup', {
                  ...obj, groupId: group.id, viewName,
                })
              else
                this.$store.dispatch('list/addTaskByIndexCalendarOrder', {
                  ...obj,
                  ids: utilsTask.concatArraysRemovingOldEls(viewTasksOrder, obj.ids),
                  date: currentDate,
                })
            },
            onSortableAdd: (evt, taskIds, type, ids) => {
              if (isSmartOrderViewType)
                this.$store.dispatch('group/moveTasksToGroup', {
                  taskIds, ids, groupId: group.id, viewName,
                })
              else
                this.$store.dispatch('group/moveTasksToGroupCalendarOrder', {
                  taskIds, ids, date: currentDate, groupId: group.id,
                  ids: utilsTask.concatArraysRemovingOldEls(viewTasksOrder, ids)
                })
            }
          })
        }
      }

      if (!isSmartOrderViewType)
        arr = [...arr, ...this.lastDayDeadlineItemsHeadings]
      else
        arr = [...arr, ...this.smartOrderListHeadings]

      return arr
    },
    viewOrders() {
      const info = this.userInfo
      if (info && info.viewOrders) return info.viewOrders
      return {}
    },
    isHeadingsView() {
      return [
        'Upcoming',
        'Logbook',
        'Logged lists',
        'Recurring',
        'Deadlines',
        'Later lists',
      ].includes(this.viewName)
    },
    isFixedHeadingsView() {
      return [
        'Logbook',
        'Deadlines',
        'Recurring',
        'Upcoming',
        'Logged lists',
        'Later lists',
      ].includes(this.viewName)
    },
    calendarOrders() {
      const info = this.userInfo
      if (info && info.calendarOrders)
        return info.calendarOrders
      return {}
    },
    prefix() {
      const type = this.viewType
      if (this.isSmart || type === 'search') return 'smartList'
      if (type === 'list') return 'list'
      if (type === 'folder') return 'folder'
      if (type === 'group') return 'group'
      return 'tag'
    },
    deadlinesViewHeadings() {
      const arr = []
      const tod = mom()
      const dispatch = this.$store.dispatch

      arr.push({
        name: 'Overdue',
        id: 'Overdue',
        disableSortableMount: true,

        sort: this.sortArray,
        filter: task => this.isTaskInView(task, 'Overdue'),
      })

      for (let i = 0;i < 7;i++) {
        tod.add(1, 'day')
        const date = tod.format('Y-M-D')

        arr.push(
          this.getCalendarOrderTypeHeadings(date, {
            disableDeadlineStr: true,
            
            filter: task => task.deadline === date,
            fallbackItem: task => {
              if (!task.deadline)
                task.deadline = date
              return task
            },
            onSortableAdd: (evt, taskIds, type, ids) => {
              dispatch('task/saveTasksById', {
                ids: taskIds,
                tasks: {deadline: date},
              })
            },
          })
        )
      }
      return arr.concat(
        this.getWholeYearCalendarHeadings({
          'This month': {
            filter: this.isTaskDeadlineThisMonth,
            disableDeadlineStr: true,
          },
          'months': {
            filter: this.isTaskDeadlineInMonth,
            disableDeadlineStr: true,
          },
          'Upcoming years': {
            filter: this.isTaskDeadlineInOneYear,
            disableDeadlineStr: true,
          },
        }, false)
      )
    },
    recurringHeadings() {
      return [{
        name: 'Recurring lists',
        id: 'Recurring lists',
        icon: 'tasks',

        disableSortableMount: true,        

        listType: true,
        disableDeadlineStr: true,
        directFiltering: true,

        comp: 'List',
        editComp: 'ListEdit',
        itemPlaceholder: 'List name...',

        sort: this.sortArray,
        order: [],
        filter: this.isRecurringList,
      }]
    },
    upcomingHeadings() {
      const arr = []
      const tod = mom()

      for (let i = 0;i < 7;i++) {
        tod.add(1, 'day')
        arr.push(
          this.getCalendarOrderTypeHeadings(tod.format('Y-M-D'), {
            disableCalendarStr: true,
          })
        )
      }
      return arr.concat(
        this.getWholeYearCalendarHeadings({}, true)
      )
    },
    laterListsHeadings() {
      const arr = []

      const laterLists = this.getLaterLists()

      if (laterLists.length > 0) {

        const set = new Set()
        for (const t of laterLists)
          set.add(t.calendar.specific)
        const dates = Array.from(set)
        dates.sort((a, b) => {
          const ta = mom(a, 'Y-M-D')
          const tb = mom(b, 'Y-M-D')
          if (ta.isAfter(tb, 'day'))
            return 1
          if (ta.isBefore(tb, 'day'))
            return -1
          return 0
        })

        const calendar = this.calendarOrders

        for (const date of dates) {
          const itemsOrder = (calendar[date] && calendar[date].tasks) || []

          const updateIds = ids => {
            this.$store.dispatch('task/saveCalendarOrder', {
              ids: utilsTask.concatArraysRemovingOldEls(itemsOrder, ids),
              date,
            })  
          }
          
          const filter = pipeBooleanFilters(
            list => this.isLaterList(list, date),
            list => list.calendar.specific === date
          )

          const dispatch = this.$store.dispatch
          arr.push({
            name: date,
            id: date,
            calendarEvents: date,
            dateType: true,

            listType: true,
            directFiltering: true,

            comp: 'List',
            editComp: 'ListEdit',
            itemPlaceholder: 'List name...',
            
            sort: this.sortArray,
            order: itemsOrder,
            options: lists => [],
            filter,

            updateIds,
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
            onAddItem: obj => {
              this.$store.dispatch('list/addListByIndexCalendarOrder', {
                ...obj,
                ids: utilsTask.concatArraysRemovingOldEls(itemsOrder, obj.ids),
                date,
              })
            },
            onSortableAdd: (evt, itemsIds, type, ids) => {
              this.$store.dispatch('list/saveListsById', {
                ids: itemsIds,
                list: {calendar: {
                  type: 'specific',
                  editDate: mom().format('Y-M-D'),
                  begins: mom().format('Y-M-D'),
                  specific: date,
                }},
              })
            }
          })
        }

      }
      
      return arr
    },
    logbookHeadings() {
      const arr = []
      const tod = mom()
      const sort = ([], tasks) => utilsTask.sortTasksByTaskDate(tasks, 'fullLogDate')
      const dispatch = this.$store.dispatch
      
      const options = tasks => [
            {
              name: 'Remove from logbook',
              icon: 'logbook',
              callback: () => dispatch('task/unlogTasks', tasks.map(el => el.id)),
            },
            {
              name: 'Delete tasks',
              icon: 'trash',
              callback: () => dispatch('task/deleteTasks', tasks.map(t => t.id)),
            },
          ]

      for (let i = 0; i < 7;i++) {
        const date = tod.format('Y-M-D')
        
        const dispatch = this.$store.dispatch

        let name = date
        if (i === 0)
          name = 'Today'
        else if (i === 1)
          name = 'Yesterday'
        
        arr.push({
          dateType: true,
          disableSortableMount: true,
          name,
          log: true,

          sort, 
          options,
          filter: t => t.logDate === date,
          id: date,
        })
        tod.subtract(1, 'd')
      }

      arr.push({
        name: 'Last week',
        disableSortableMount: true,
        dateType: true,
        logStr: true,
        log: true,
        sort,
        options,
        filter: t => this.wasTaskLoggedLastWeek(t),
        id: 'last week',
      })

      const now = mom()
      const m = now.month()
      arr.push({
        name: 'This month',
        disableSortableMount: true,
        dateType: true,
        logStr: true,
        log: true,
        sort,
        options,
        filter: t => this.wasTaskLoggedInMonth(t, m),
        id: 'this month',
      })
      now.subtract(1, 'month')

      for (let month = now.month();month > -1;month--) {
        arr.push({
          name: now.format('MMMM'),
          id: month,
          showHeading: true,
          disableSortableMount: true,
          logStr: true,
          log: true,
          sort,
          options,
          filter: t => this.wasTaskLoggedInMonth(t, month),
        })
        
        now.subtract(1, 'month')
      }
      arr.push({
        name: 'Old stuff',
        id: 'old',
        showHeading: true,
        disableSortableMount: true,
        logStr: true,
        log: true,
        sort,
        options,
        filter: this.isOldTask
      })
      
      return arr
    },
    todayHeadingsOptions() {
      const dispatch = this.$store.dispatch
      const saveTasksDay = (ids, mom) => {
        dispatch('task/saveTasksById', {
          ids, task: {calendar: this.$store.getters['task/getSpecificDayCalendarObj'](mom)}
        })
      }
      const sort = ([], tasks) => utilsTask.sortTasksByTaskDate(tasks)

      let todayTasks = []
      const viewOrder = this.viewOrders['Today']
      if (viewOrder)
        todayTasks = viewOrder.tasks || []
      
      return [
        {
          name: 'Overdue',
          id: 'overdue',
          color: 'var(--red)',

          sort,
          react: [
            'calendar',
            'completed',
          ],
          filter: task => this.isTaskInView(task, 'Overdue'),
          options: tasks => {
            const overIds = tasks.map(el => el.id)
            return [
              {
                name: 'Move to today',
                icon: 'star',
                callback: () => saveTasksDay(overIds, mom())
              },
              {
                name: 'Move to tomorrow',
                icon: 'sun',
                callback: () => saveTasksDay(overIds, mom().add(1, 'd'))
              },
              {
                name: 'Select date',
                icon: 'calendar',
                callback: () => {return {
                  comp: 'CalendarPicker',
                  content: {callback: (calendar) => {
                    dispatch('task/saveTasksById', {
                      ids: overIds,
                      task: {calendar},
                    })}
                  }
                }}
              }
            ]
          },
        },
        {
          sort: this.sortArray,
          order: todayTasks,
          name: 'Today',
          id: 'todya',
          filter: task => this.isTaskInView(task, 'Today'),
        },
      ]
    },
    lastDayDeadlineItemsHeadings() {

      const arr = []
      const itemsOrder = this.getCurrentScheduleTasksOrder
      const dispatch = this.$store.dispatch

      const date = this.getCalendarOrderDate

      const saveOrder = ids => {
        this.$store.dispatch('task/saveCalendarOrder', {
          ids: utilsTask.concatArraysRemovingOldEls(itemsOrder, ids),
          date,
        })
      }
      const onListAddItem = obj => {
        this.$store.dispatch('list/addListByIndexCalendarOrder', {
          ...obj,
          ids: utilsTask.concatArraysRemovingOldEls(itemsOrder, obj.ids),
          date,
        })
      }
      
      if (this.hasEndsTodayLists) {
        const filterFunction = l => this.isListLastDeadlineDay(l, date)

        arr.push({
          name: 'Ends today lists',
          id: 'LAST_DEADLINE_DAY_LIST',
          icon: 'deadline',
          color: 'var(--red)',

          listType: true,
          disableDeadlineStr: true,
          directFiltering: true,

          comp: 'List',
          editComp: 'ListEdit',
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
          updateIds: saveOrder,
          fallbackItem: (list, force) => {
            if (force || !list.deadline)
              list.deadline = mom().format('Y-M-D')
            return list
          },
          onAddItem: onListAddItem
        })
      }
      if (this.hasBeginsTodayLists) {
        const filterFunction = l => this.isListBeginDay(l, date)

        arr.push({
          name: 'Begins today lists',
          id: 'BEGINDS_TODAY_LISTS',
          icon: 'calendar',

          listType: true,
          directFiltering: true,

          comp: 'List',
          editComp: 'ListEdit',
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
          updateIds: saveOrder,
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
          onAddItem: onListAddItem
        })
      }
      if (this.hasEndsTodayTasks) {
        const filterFunction = l => this.isTaskLastDeadlineDay(l, date)

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
          updateIds: saveOrder,
          fallbackItem: (task, force) => {
            if (force || !task.deadline)
              task.deadline = mom().format('Y-M-D')
            return task
          },
          onAddItem: obj => {
            this.$store.dispatch('list/addTaskByIndexCalendarOrder', {
              ...obj,
              ids: utilsTask.concatArraysRemovingOldEls(itemsOrder, obj.ids),
              date,
            })
          }
        })
      }
      
      return arr
    },
    smartOrderListHeadings() {

      const viewName = this.viewName

      const arr = []

      const itemsOrder = (this.viewOrders[viewName] && this.viewOrders[viewName].lists) || []
      const dispatch = this.$store.dispatch

      const filterFunction = l => this.isListInView(l, viewName)

      let color
      if (viewName === 'Someday')
        color = 'var(--brown)'
      if (viewName === 'Anytime')
        color = 'var(--dark-blue)'

      arr.push({
        color,
        name: 'Lists',
        id: 'LISTS_SMART_VIEW_RODER',
        icon: 'tasks',
        showHeading: true,

        listType: true,
        directFiltering: true,

        comp: 'List',
        editComp: 'ListEdit',
        itemPlaceholder: 'List name...',
        
        sort: this.sortArray,
        order: itemsOrder,
        filter: filterFunction,
        options: lists => [],
        updateIds: ids => {
          dispatch('list/saveListsSmartViewOrderListIds', {
            ids, viewName,
          })
        },
        fallbackItem: (list, force) => {
          return list
        },
        onAddItem: obj => {
          dispatch('list/addListByIndexSmartViewOrderListIds', {
            ...obj, viewName: viewName,
          })
        }
      })

      return arr
    },

    periodicTasks() {
      return this.tasks.filter(el => el.calendar && el.calendar.type === 'periodic')
    },
    weeklyTasks() {
      return this.tasks.filter(el => el.calendar && el.calendar.type === 'weekly')
    },
    viewList() {
      return this.getListByName(this.viewName)
    },
    isViewListSomeday() {
      const list = this.viewList
      return list && this.$store.getters['list/isListSomeday'](list)
    },
    viewFolder() {
      return this.$store.getters['folder/getFoldersByName']([this.viewName])[0]
    },
    viewGroup() {
      return this.$store.getters['group/getGroupsByName']([this.viewName])[0]
    },
    isListType() {
      return !this.isSmart && this.viewList && this.viewType === 'list'
    },
    isSmartOrderViewType() {
      const n = this.viewName
      return this.viewType === 'list' && this.isSmart &&
        (n === 'Someday' || n === 'Anytime' || n === 'Inbox')
    },
    getCalendarOrderDate() {
      let currentDate = mom()
      const n = this.viewName
      if (n !== 'Tomorrow' && n !== 'Today' && n !== 'Calendar')
        return null
      if (n === 'Tomorrow')
        currentDate.add(1, 'd')

      currentDate = currentDate.format('Y-M-D')

      if (n === 'Calendar')
        currentDate = this.calendarDate

      return currentDate
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
    ungroupTasksInHeadings() {
      return this.userInfo.ungroupTasksInHeadings
    },
    isCalendarOrderViewType() {
      const n = this.viewName
      return this.viewType === 'list' && this.isSmart && 
        (n === 'Today' || n === 'Tomorrow' || n === 'Calendar')
    },
    hasEndsTodayLists() {
      return this.getEndsTodayLists(this.getCalendarOrderDate).length > 0
    },
    hasBeginsTodayLists() {
      return this.getBeginsTodayLists(this.getCalendarOrderDate).length > 0
    },
    hasEndsTodayTasks() {
      return this.getEndsTodayTasks(this.getCalendarOrderDate).length > 0
    },
    hasOverdueTasks() {
      return this.getOverdueTasks().length > 0
    },
    viewTag() {
      return this.tags.find(el => el.name === this.viewName)
    },
  },
}

</script>
