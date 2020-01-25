<template>
  <ViewRenderer
    v-bind="$props"

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
    :removeListHandlerWhenThereArentLists='removeListHandlerWhenThereArentLists'

    :mainFilter='mainFilter'
    :rootFilter='rootFilter'
    :tasksOrder='tasksOrder'
    :onSortableAdd='onSortableAdd'
    :viewNameValue='viewNameValue'
    :deadline='deadline'
    :saveHeaderContent='saveHeaderContent'
    :mainFallbackItem='mainFallbackItem'
    :showHeading='showHeading'
    :headerTags='headerTags'
    :headerCalendar='headerCalendar'
    :itemCompletionCompareDate='itemCompletionCompareDate'
    :files='files'
    :headingsPagination='headingsPagination'
    :configFilterOptions='configFilterOptions'
    :smartComponent='smartComponent'
    :onSmartComponentUpdate='onSmartComponentUpdate'
    :viewComponent='viewComponent'
    :isListType='isListType'
    :extraListView='extraListView'
    :removeHeaderTag='removeHeaderTag'

    @save-schedule='saveSchedule'
    @save-header-name='saveHeaderName'
    @save-notes='saveNotes'
    @add-task='addTask'
    @add-heading='addHeading'
    @update-ids='updateIds'
    @remove-defer-date='removeDeferDate'
    @remove-deadline='removeDeadline'
    @remove-repeat='removeRepeat'
    
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
  props: ['isSmart', 'viewName', 'viewType'],
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
  },
  computed: {
    ...mapState({
      userInfo: state => state.userInfo,      
    }),
    ...mapMutations(['pushToast']),
    ...mapGetters({
      lists: 'list/lists',
      folders: 'folder/folders',
      tags: 'tag/tags',
      tasks: 'task/tasks',
      l: 'l',
      isDesktop: 'isDesktop',
      getAllTasksOrderByList: 'list/getAllTasksOrderByList',
      getFolderTaskOrderById: 'folder/getFolderTaskOrderById',
      isTaskInList: 'task/isTaskInList',
      getOverdueTasks: 'task/getOverdueTasks',
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
      isTaskCompleted: 'task/isTaskCompleted',
      isTaskInView: 'task/isTaskInView',
      doesTaskPassInclusiveTags: 'task/doesTaskPassInclusiveTags',
      doesTaskIncludeText: 'task/doesTaskIncludeText',
      isTaskInHeading: 'task/isTaskInHeading',
      filterTasksByCompletionDate: 'task/filterTasksByCompletionDate',
      getTagsById: 'tag/getTagsById',
      getListsById: 'list/getListsById',
      getListByName: 'list/getListByName',
      getSpecificDayCalendarObj: 'task/getSpecificDayCalendarObj',
    }),
    getListHeadingsByView() {
      const viewName = this.viewName
      const savedLists = this.lists
      const savedFolders = this.folders
      const setOfLists = new Set()
      const setOfFolders = new Set()
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
      let lists = Array.from(setOfLists)
      lists.forEach(l => l.smartViewControllerType = 'list')
      let folders = Array.from(setOfFolders)
      folders.forEach(f => f.smartViewControllerType = 'folder')

      const sortArray = this.$store.getters.checkMissingIdsAndSortArr

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
      const headings = sortArray(order, [...folders, ...lists])

      const arr = []
      for (const viewHeading of headings) {
        if (viewHeading.smartViewControllerType === 'list') {
          const list = viewHeading
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
            for (const id of calendarOrder)
              if (taskIdsFromList.includes(id)) {
                found = true
                break
              }

            if (found) tasksOrder = calendarOrder
            else tasksOrder = taskIdsFromList
          }
          calendarOrder = utilsTask.concatArraysRemovingOldEls(calendarOrder, tasksOrder)
          
          const saveOrder = ids => {
            if (isSmartOrderViewType) {
              this.$store.dispatch('list/saveSmartViewHeadingTasksOrder', {
                ids, listId: list.id, smartView: viewName,
              })
            } else {
              this.$store.dispatch('task/saveCalendarOrder', {
                ids: utilsTask.concatArraysRemovingOldEls(calendarOrder, ids),
                date: currentDate,
              })
            }
          }

          const filterFunction = task => this.isTaskInList(task, list.id)

          const sort = tasks => sortArray(calendarOrder, tasks)

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
            sort,
            progress: () => this.$store.getters['list/pieProgress'](this.tasks, list.id, this.isTaskCompleted),
            filter: filterFunction,
            options: tasks => [
              {
                name: this.l['Change date'],
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
              if (force || (!task.list && !task.folder))
                task.list = list.id
              return task
            },
            onAddTask: obj => {
              if (isSmartOrderViewType)
                this.$store.dispatch('list/addTaskByIndexSmartViewList', {
                  ...obj, listId: list.id, viewName: viewName,
                })
              else
                this.$store.dispatch('list/addTaskByIndexCalendarOrder', {
                  ...obj,
                  ids: utilsTask.concatArraysRemovingOldEls(calendarOrder, obj.ids),
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
                  ids: utilsTask.concatArraysRemovingOldEls(calendarOrder, ids)
                })
            }
          })
        } else if (viewHeading.smartViewControllerType === 'folder') {
          const folder = viewHeading
            let tasksOrder = []
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
              for (const id of calendarOrder)
                if (taskIdsFromFolder.includes(id)) {
                  found = true
                  break
                }

              if (found) tasksOrder = calendarOrder
              else tasksOrder = taskIdsFromFolder
            }
          calendarOrder = utilsTask.concatArraysRemovingOldEls(calendarOrder, tasksOrder)
          
          const saveOrder = ids => {
            if (isSmartOrderViewType)
              this.$store.dispatch('folder/saveSmartViewHeadingTasksOrder', {
                ids, folderId: folder.id, smartView: viewName,
              })
            else
              this.$store.dispatch('task/saveCalendarOrder', {
                ids: utilsTask.concatArraysRemovingOldEls(calendarOrder, ids),
                date: currentDate,
              })
          }

          const filterFunction = task => this.isTaskInFolder(task, folder.id)

          const sort = tasks => sortArray(calendarOrder, tasks)
          
          arr.push({
            name: folder.name,
            allowEdit: true,
            hideListName: true,
            hideFolderName: true,
            showHeadingName: true,
            icon: 'folder',
            id: folder.id,

            onEdit: tasks => name => {
              this.$store.dispatch('folder/saveFolder', {
                name, id: folder.id,
              })
            },
            sort,
            filter: filterFunction,
            options: tasks => [
              {
                name: this.l['Change date'],
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
              if (force || (!task.list && !task.folder))
                task.folder = folder.id
              return task
            },
            onAddTask: obj => {
              if (isSmartOrderViewType)
                this.$store.dispatch('list/addTaskByIndexSmartViewFolder', {
                  ...obj, folderId: folder.id, viewName: viewName,
                })
              else
                this.$store.dispatch('list/addTaskByIndexCalendarOrder', {
                  ...obj,
                  ids: utilsTask.concatArraysRemovingOldEls(calendarOrder, obj.ids),
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
                  ids: utilsTask.concatArraysRemovingOldEls(calendarOrder, ids)
                })
            }
          })
        }
      }

      return arr
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
    prefix() {
      const type = this.viewType
      if (this.isSmart || type === 'search') return 'smartList'
      if (type === 'list') return 'list'
      if (type === 'folder') return 'folder'
      return 'tag'
    },
    upcomingHeadingsOptions() {
      const arr = []
      const tod = mom()
      const calObj = date => ({
        type: 'specific',
        time: null,
        editDate: mom().format('Y-M-D'),
        begins: mom().format('Y-M-D'),

        specific: date,
      })
      const filtered = this.tasks.filter(el => {
        return el.calendar && el.calendar.type === 'specific'
      })
      const calendarOrders = this.calendarOrders
      const sort = utilsTask.sortTasksByTaskDate
      const TOD_STR = mom().format('Y-M-D')

      for (let i = 0;i < 7;i++) {
        tod.add(1, 'day')
        const date = tod.format('Y-M-D')

        const sortHeading = tasks =>
          this.$store.getters.checkMissingIdsAndSortArr((calendarOrders[date] && calendarOrders[date].tasks) || [], tasks)

        const filterFunction = task => this.isTaskShowingOnDate(task, date, true)
        
        arr.push({
          name: utils.getHumanReadableDate(date, this.l),
          id: date,
          showHeading: true,

          sort: sortHeading,
          filter: filterFunction,
          fallbackItem: task => {
            if (!task.calendar)
              task.calendar = calObj(date)
            return task
          },
          onAddTask: obj => {
            const date = obj.header.id
            this.$store.dispatch('task/addTask', {
              ...obj.task
            })
          },
          onSortableAdd: (evt, taskIds, type, ids) => {
            this.$store.dispatch('task/saveTasksById', {
              ids: taskIds,
              task: {calendar: calObj(date)},
            })
          },
          updateIds: ids => {
            this.$store.dispatch('task/saveCalendarOrder', {ids, date})
          }
        })
      }
      const thisMonthPipe = pipeBooleanFilters(
        this.isTaskInSevenDays,
        task => this.isTaskInPeriod(task, TOD_STR, 'month', true)
      )
      // this month
      arr.push({
        name: this.l['This month'],
        disableSortableMount: true,
        calendarStr: true,
        sort,
        filter: thisMonthPipe,
        id: 'this month',
      })
      // this year
      const thisYearPipe = pipeBooleanFilters(
        this.isTaskInOneMonth,
        task => this.isTaskInPeriod(task, TOD_STR, 'year', true)
      )
      arr.push({
        name: this.l['This year'],
        disableSortableMount: true,
        calendarStr: true,
        sort,
        filter: thisYearPipe,
        id: 'this year'
      })
      // next years
      arr.push({
        name: this.l['Next years'],
        disableSortableMount: true,
        calendarStr: true,
        sort,
        filter: this.isTaskInOneYear,
        id: 'nextYears',
      })
      // periodic tasks
      arr.push({
        disableSortableMount: true,
        name: this.l['Periodic tasks'],
        calendarStr: true,
        sort,
        filter: task => task.calendar && task.calendar.type === 'periodic',
        id: 'periodic tasks'
      })
      // weekly tasks
      arr.push({
        disableSortableMount: true,
        name: this.l['Weekly tasks'],
        calendarStr: true,
        sort,
        filter: task => task.calendar && task.calendar.type === 'weekly',
        id: 'weekly tasks'
      })
      return arr
    },
    completedHeadingsOptions() {
      const arr = []
      const filtered = this.tasks.filter(task => this.isTaskCompleted(task, mom().format('Y-M-D')))
      const set = new Set()
      for (const t of filtered)
        if (!set.has(t.completeDate))
          set.add(t.completeDate)
      const dates = Array.from(set)
      dates.sort((a, b) => {
        const ta = mom(a, 'Y-M-D')
        const tb = mom(b, 'Y-M-D')
        if (ta.isAfter(tb, 'day'))
          return -1
        if (ta.isBefore(tb, 'day'))
          return 1
        return 0
      })

      for (const date of dates) {
        const filterFunction = pipeBooleanFilters(
          task => this.hasTaskBeenCompletedOnDate(task, date),
        )

        const dispatch = this.$store.dispatch
        arr.push({
          disableSortableMount: true,
          name: utils.getHumanReadableDate(date, this.l),
          sort: tasks => utilsTask.sortTasksByTaskDate(tasks, 'fullCompleteDate'), 
          options: tasks => [
            {
              name: this.l['Uncomplete tasks'],
              icon: 'circle',
              important: true,
              callback: () => dispatch('task/uncompleteTasks', tasks),
            },
            {
              name: this.l['Delete tasks'],
              icon: 'trash',
              important: true,
              callback: () => dispatch('task/deleteTasks', tasks.map(t => t.id)),
            },
          ],
          filter: filterFunction,
          id: date,
        })
      }
      return arr
    },
    todayHeadingsOptions() {
      const dispatch = this.$store.dispatch
      const l = this.l
      const saveTasksDay = (ids, mom) => {
        dispatch('task/saveTasksById', {
          ids, task: {calendar: this.$store.getters['task/getSpecificDayCalendarObj'](mom)}
        })
      }
      const sort = tasks => utilsTask.sortTasksByTaskDate(tasks)

      let todayTasks = []
      const viewOrder = this.viewOrders['Today']
      if (viewOrder)
        todayTasks = viewOrder.tasks || []
      
      return [
        {
          name: l['Overdue'],
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
          sort: tasks => this.$store.getters.checkMissingIdsAndSortArr(todayTasks, tasks),
          name: l['Today'],
          id: 'todya',
          filter: task => this.isTaskInView(task, 'Today'),
        },
      ]
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
    notHeadingHeaderView() {
      const n = this.viewName
      return n !== 'Upcoming' && n !== 'Completed'
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
    hasOverdueTasks() {
      return this.getOverdueTasks().length > 0
    },
    viewTag() {
      return this.tags.find(el => el.name === this.viewName)
    },
  },
}

</script>
