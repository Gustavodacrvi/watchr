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
    :headingEditOptions='headingEditOptions'
    :headerOptions='headerOptions'
    :notes='getViewNotes'
    :progress='getPieProgress'
    :headings='headings'
    :headingsOrder='headingsOrder'
    :itemModelFallback='itemModelFallback || {}'
    :calendarDate='calendarDate'
    :showAllHeadingsItems='showAllHeadingsItems'
    :rootFallbackItem='rootFallbackItem'
    :getCalendarOrderDate='getCalendarOrderDate'
    :removeListHandlerWhenThereArentLists='removeListHandlerWhenThereArentLists'

    :sidebarHided='sidebarHided'

    :mainFilter='mainFilter'
    :disableRootActions='disableRootActions'
    :rootFilter='rootFilter'
    :tasksOrder='tasksOrder'
    :viewNameValue='viewNameValue'
    :headerInfo='headerInfo'
    :saveHeaderContent='saveHeaderContent'
    :mainFallbackItem='mainFallbackItem'
    :showHeading='showHeading'
    :itemCompletionCompareDate='itemCompletionCompareDate'
    :configFilterOptions='configFilterOptions'
    :viewComponent='viewComponent'
    :isListType='isListType'
    :viewItem='viewItem'
    :extraListView='extraListView'
    :removeHeaderTag='removeHeaderTag'
    :saveHeaderName='saveHeaderName'
    :fallbackFunctionData='fallbackFunctionData'
    :updateViewIds='updateIds'

    @save-schedule='saveSchedule'
    @add-task='addTask'
    @add-heading='addHeading'
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

import functionFallbacks from '@/utils/functionFallbacks.js'

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

      headingSchedules: {},
    }
  },
  methods: {
    saveSchedule(schedule, date = this.getCalendarOrderDate) {
      this.$store.dispatch('task/saveSchedule', {
        schedule, date,
      })
    },
    getLogbookOptions() {
      const dispatch = this.$store.dispatch
      return tasks => [
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
    },
    getCalObjectByView(viewName) {
      if (this.viewName === 'Today')
        return this.getSpecificDayCalendarObj(mom())
      if (this.viewName === 'Tomorrow')
        return this.getSpecificDayCalendarObj(mom().add(1, 'day'))
      if (this.viewName === 'Someday')
        return {type: 'someday'}
      if (this.viewName === 'Anytime')
        return {type: 'anytime'}
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
        calendarDate: date,

        sort: o.sort ? o.sort : this.sortArray,
        order: o.order ? o.order : this.getCalendarOrderByDate(date),

        filter: o.filter ? o.filter : task => this.isTaskShowingOnDate(task, date, true),
        fallbackFunctionData: o.fallbackFunctionData ? o.fallbackFunctionData : () => ({
          calendarDate: date,
        }),
        fallbackItem: o.fallbackItem ? o.fallbackItem : (t, f) => functionFallbacks.viewFallbacks.calendarOrder(t, f, date),
        updateViewIds: functionFallbacks.updateOrderFunctions.calendarOrder,
        itemModelFallback: o.itemModelFallback || {
          calendar: this.getSpecificDayCalendarObj(date),
        },
      }
    },
  },
  computed: {
    ...mapState({
      userInfo: state => state.userInfo,
      groups: state => state.group.groups,
      userId: state => state.user.uid,
      user: state => state.user,
    }),
    ...mapMutations(['pushToast']),
    ...mapGetters({
      calendarDate: 'calendarDate',
      lists: 'list/lists',
      folders: 'folder/folders',
      tags: 'tag/tags',
      logTasks: 'task/logTasks',
      getSpecificDayCalendarObj: 'task/getSpecificDayCalendarObj',
      tasks: 'task/tasks',
      isDesktopBreakPoint: 'isDesktopBreakPoint',
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
      isTaskInLogbook: 'task/isTaskInLogbook',
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
      getListsByName: 'list/getListsByName',
      getSpecificDayCalendarObj: 'task/getSpecificDayCalendarObj',
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
          
          const saveOrder = isSmartOrderViewType ?
            functionFallbacks.updateOrderFunctions.smartViewLists
             : functionFallbacks.updateOrderFunctions.calendarOrder

          const filterFunction = task => this.isTaskInList(task, list.id)

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
              group: list.group || undefined,
            },
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
          
          const saveOrder = isSmartOrderViewType ?
            functionFallbacks.updateOrderFunctions.smartViewFolders
             : functionFallbacks.updateOrderFunctions.calendarOrder

          const filterFunction = task => this.isTaskInFolder(task, folder.id)

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

          const filterFunction = task => this.isTaskInGroup(task, group.id)

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

      if (!(this.isCalendarOrderViewType && this.ungroupTasksInHeadings)) 
        arr = this.getListFolderGroupCalendarHeadings

      if (this.isCalendarOrderViewType) {
        const calendarDate = this.getCalendarOrderDate
        let scheduleOrder = this.getCurrentScheduleTasksOrder.slice()

        arr.unshift({
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
      if (type === 'calendar') return 'calendar'
      return 'tag'
    },
    deadlinesViewHeadings() {
      let arr = []
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
            fallbackItem: (t, f) => functionFallbacks.viewFallbacks.deadlineOrder(t, f, date),
            updateViewIds: functionFallbacks.updateOrderFunctions.calendarOrder,
            itemModelFallback: {deadline: date},
          })
        )
      }
      arr = arr.concat(
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

      arr.push({
        name: 'Lists',
        id: 'LISTS_WITH_DEADLIENS',
        icon: 'tasks',

        disableSortableMount: true,        

        listType: true,
        disableDeadlineStr: true,
        directFiltering: true,

        comp: 'List',
        editComp: 'List',
        itemPlaceholder: 'List name...',

        sort: this.sortArray,
        order: [],
        filter: l => l.deadline,
      })
      
      return arr
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
        editComp: 'List',
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
        const date = tod.format('Y-M-D')
        const orders = this.calendarOrders
        
        arr.push(
          this.getCalendarOrderTypeHeadings(date, {
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
      const viewOrders = this.viewOrders
      const viewName = this.viewName

      const smartOrder = (viewOrders[viewName] && viewOrders[viewName].tasks) || []
      
      arr.push({
        name: 'Someday lists',
        id: 'SOMEDAY_LISTS',

        listType: true,
        directFiltering: true,

        comp: 'List',
        editComp: 'List',
        itemPlaceholder: 'List name...',
        
        sort: this.sortArray,
        order: smartOrder,
        filter: l => l.calendar && l.calendar.type === 'someday',

        fallbackFunctionData: () => ({
          viewName,
        }),
        updateViewIds: functionFallbacks.updateOrderFunctions.smartOrder,
        fallbackItem: (list, force) => {
          if (force || !list.calendar) {
            const m = mom().format('Y-M-D')
            list.calendar = {
              type: 'someday',
              editDate: m,
              begins: m,
            }
          }
          return list
        },
      })
      arr.push({
        name: 'Recurring lists',
        id: 'RECURRING_LISTS',
        disableSortableMount: true,

        listType: true,
        directFiltering: true,

        comp: 'List',
        editComp: 'List',
        itemPlaceholder: 'List name...',
        
        sort: this.sortArray,
        order: smartOrder,
        filter: this.isRecurringList,

        fallbackFunctionData: () => ({
          viewName,
        }),
        updateViewIds: functionFallbacks.updateOrderFunctions.smartOrder,
      })
      
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
            editComp: 'List',
            itemPlaceholder: 'List name...',
            
            sort: this.sortArray,
            order: itemsOrder,
            options: lists => [],
            filter,

            fallbackFunctionData: () => ({
              calendarDate: date,
              scheduleOrder: itemsOrder,
            }),
            updateViewIds: functionFallbacks.updateOrderFunctions.calendarOrder,
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
      
      const options = this.getLogbookOptions()

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
    logbookLists() {
      const arr = []
      const tod = mom()
      const sort = ([], tasks) => utilsTask.sortTasksByTaskDate(tasks, 'fullLogDate')
      const dispatch = this.$store.dispatch
      
      const options = lists => [
            {
              name: 'Remove from logbook',
              icon: 'faded-logged-lists',
              callback: () => dispatch('list/unlogLists', lists.map(el => el.id)),
            },
            {
              name: 'Delete lists',
              icon: 'trash',
              callback: () => dispatch('list/deleteMultipleListsByIds', lists.map(t => t.id)),
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

          listType: true,
          disableDeadlineStr: true,
          directFiltering: true,

          comp: 'List',
          editComp: 'List',
          itemPlaceholder: 'List name...',

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
        listType: true,
        disableDeadlineStr: true,
        directFiltering: true,

        comp: 'List',
        editComp: 'List',
        itemPlaceholder: 'List name...',
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
        listType: true,
        disableDeadlineStr: true,
        directFiltering: true,

        comp: 'List',
        editComp: 'List',
        itemPlaceholder: 'List name...',
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
          listType: true,
          disableDeadlineStr: true,
          directFiltering: true,

          comp: 'List',
          editComp: 'List',
          itemPlaceholder: 'List name...',
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
        listType: true,
        disableDeadlineStr: true,
        directFiltering: true,

        comp: 'List',
        editComp: 'List',
        itemPlaceholder: 'List name...',
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
          ids, task: {calendar: this.getSpecificDayCalendarObj(mom)}
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
          itemModelFallback: {
            calendar: this.getCalObjectByView(this.viewName),
          },
        },
      ]
    },
    lastDayDeadlineItemsHeadings() {

      const arr = []
      const itemsOrder = this.getCurrentScheduleTasksOrder
      const dispatch = this.$store.dispatch

      const date = this.getCalendarOrderDate
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
      if (this.hasBeginsTodayLists) {
        const filterFunction = l => this.isListBeginDay(l, date)

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
    searchHeadings() {
      return [
        {
          name: 'Logbook tasks',
          id: 'logbook tasks',
          disableSortableMount: true,
          logStr: true,
          log: true,
          icon: 'logbook',
          color: 'var(--dark-blue)',

          options: this.getLogbookOptions(),
          sort: ([], tasks) => utilsTask.sortTasksByTaskDate(tasks, 'fullLogDate'),
          filter: task => 
            this.isTaskInLogbook(task) &&
            this.doesTaskIncludeText(task, this.viewName),
          configFilterOptions: p => p !== 'pipeCompleted',
        }
      ]
    },
    smartOrderListHeadings() {

      const viewName = this.viewName

      const arr = []

      const itemsOrder = (this.viewOrders[viewName] && this.viewOrders[viewName].lists) || []
      const dispatch = this.$store.dispatch

      const filterFunction = l => this.isListInView(l, viewName)

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

    periodicTasks() {
      return this.tasks.filter(el => el.calendar && el.calendar.type === 'periodic')
    },
    weeklyTasks() {
      return this.tasks.filter(el => el.calendar && el.calendar.type === 'weekly')
    },
    viewList() {
      return this.getListsByName([this.viewName])[0]
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
      if (this.viewType === 'calendar')
        return true
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
