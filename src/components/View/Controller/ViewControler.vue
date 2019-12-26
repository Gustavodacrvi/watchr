<template>
  <ViewRenderer
    v-bind="{ ...$props, ...props }"
    v-on="listeners"

    :prefix='prefix'
    :viewName='viewName'
    :viewType='viewType'

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

import mom from 'moment/src/moment'

import mixins from './controlerModules'

export default {
  mixins,
  props: ['isSmart'],
  components: {
    ViewRenderer: ViewRendererVue,
  },
  data() {
    return {
      showCompleted: false,
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
    getListHeadingsByView(view) {
      const savedLists = this.lists
      const savedFolders = this.folders
      const setOfLists = new Set()
      const setOfFolders = new Set()

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
      if (this.viewName === 'Tomorrow')
        currentDate.add(1, 'd')

      currentDate = currentDate.format('Y-M-D')
      
      const calendarOrder = this.calendarOrders[currentDate] || []
      // const { rootTasks, folderTasks, listTasks } = utilsTask.groupTaskIds()

      let order = this.viewOrders[view] ? this.viewOrders[view].headings : []
      if (!order) order = []
      const headings = sortArray(order, [...folders, ...lists])

      const arr = []
      for (const viewHeading of headings) {
        if (viewHeading.smartViewControllerType === 'list') {
          const list = viewHeading
          const saveOrder = ids => {
            if (this.viewName === 'Someday') {
              this.$store.dispatch('list/saveSmartViewHeadingTasksOrder', {
                ids, listId: list.id, smartView: this.viewName,
              })
            } else {
              this.$store.dispatch('task/saveCalendarOrder', {
                ids: utilsTask.getFixedIdsFromNonFilteredAndFiltered(ids, calendarOrder),
                date: currentDate,
              })
            }
          }

          const filterFunction = task => this.isTaskInList(task, list.id)
          const getSmartViewOrder = () => {
            if (list.smartViewsOrders && list.smartViewsOrders[this.viewName])
              return list.smartViewsOrders[this.viewName]
            else
              return this.getAllTasksOrderByList(list.id)
          }
          let tasksOrder = []
          if (this.viewName === 'Someday')
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

          const sort = tasks => sortArray(tasksOrder, tasks)

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
            fallbackTask: task => {
              if (!task.list && !task.folder)
                task.list = list.id
              return task
            },
            onAddTask: obj => {
              this.$store.dispatch('list/addTaskByIndexSmartViewList', {
                ...obj, listId: list.id, viewName: this.viewName,
              })
            },
            onSortableAdd: (evt, taskIds, type, ids) => {
              this.$store.dispatch('list/moveTasksToList', {
                taskIds, ids, listId: list.id, smartView: this.viewName,
              })
            }
          })
        } else if (viewHeading.smartViewControllerType === 'folder') {
          const folder = viewHeading
          const saveOrder = ids => {
            if (this.viewName === 'Someday') {
              this.$store.dispatch('folder/saveSmartViewHeadingTasksOrder', {
                ids, folderId: folder.id, smartView: this.viewName,
              })
            } else {
              this.$store.dispatch('task/saveCalendarOrder', {
                ids: utilsTask.getFixedIdsFromNonFilteredAndFiltered(ids, calendarOrder),
                date: currentDate,
              })
            }
          }

          const filterFunction = task => this.isTaskInFolder(task, folder.id)
          const getSmartViewOrder = () => {
            if (folder.smartViewsOrders && folder.smartViewsOrders[this.viewName])
              return folder.smartViewsOrders[this.viewName]
            else
              return this.getFolderTaskOrderById(folder.id)
          }

          let tasksOrder = []
          if (this.viewName === 'Someday')
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
          

          const sort = tasks => sortArray(tasksOrder, tasks)
          
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
            fallbackTask: task => {
              if (!task.list && !task.folder)
                task.folder = folder.id
              return task
            },
            onAddTask: obj => {
              this.$store.dispatch('list/addTaskByIndexSmartViewFolder', {
                ...obj, folderId: folder.id, viewName: this.viewName,
              })
            },
            onSortableAdd: (evt, taskIds, type, ids) => {
              this.$store.dispatch('folder/moveTasksToFolder', {
                taskIds, ids, folderId: folder.id, smartView: this.viewName,
              })
            }
          })
        }
      }

      return arr
    },
  },
  computed: {
    ...mapState({
      viewName: state => state.viewName,
      viewType: state => state.viewType,
      tags: state => state.tag.tags,
      tasks: state => state.task.tasks,
      lists: state => state.list.lists,
      folders: state => state.folder.folders,
      userInfo: state => state.userInfo,      
    }),
    ...mapMutations(['pushToast']),
    ...mapGetters({
      l: 'l',
      isDesktop: 'isDesktop',
      getAllTasksOrderByList: 'list/getAllTasksOrderByList',
      getFolderTaskOrderById: 'folder/getFolderTaskOrderById',
      isTaskInList: 'task/isTaskInList',
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
    viewOrders() {
      if (this.userInfo && this.userInfo.viewOrders) return this.userInfo.viewOrders
      return {}
    },
    calendarOrders() {
      if (this.userInfo && this.userInfo.calendarOrders)
        return this.userInfo.calendarOrders
      return {}
    },
    prefix() {
      if (this.isSmart || this.viewType === 'search') return 'smartList'
      if (this.viewType === 'list') return 'list'
      if (this.viewType === 'folder') return 'folder'
      return 'tag'
    },
    listeners() {
      const toCamel = s => {
        return s.replace(/([-_][a-z])/ig, $1 => {
          return $1.toUpperCase()
            .replace('-', '')
            .replace('_', '')
        })
      }
      const p = this.prefix
      
      const events = [
        'save-header-name', 'save-notes',
        'add-task', 'add-heading', 'update-ids', 'remove-defer-date',
        'remove-header-tag', 'remove-deadline', 'remove-repeat',
      ]
      const obj = {}
      
      for (const e of events)
        obj[e] = this[p + toCamel(e)]
      
      return obj
    },
    props() {
      const p = this.prefix
      
      const props = [
        'icon', 'showEmptyHeadings', 'updateHeadingIds',
        'headingEditOptions', 'headerOptions', 'notes', 'progress', 'headings', 'headingsOrder', 'showAllHeadingsItems', 'rootFallbackTask',
        'mainFilter', 'rootFilter', 'tasksOrder', 'onSortableAdd', 'viewNameValue', 'headerDates', 'mainFallbackTask', 'showHeading',
        'headerTags', 'headerCalendar', 'taskCompletionCompareDate', 'files',
        'headingsPagination', 'configFilterOptions', 'smartComponent', 'onSmartComponentUpdate',
      ]
      const obj = {}

      for (const v of props)
        obj[v] = this[p + v]
      
      obj['showEmptyHeadings'] = this['isListType']
      obj['showHeadadingFloatingButton'] = this['isListType']
      obj['notes'] = this[p + 'getViewNotes']
      obj['progress'] = this[p + 'getPieProgress']
      
      return obj
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
      const sort = utilsTask.sortTasksByTaskDate
      const TOD_STR = mom().format('Y-M-D')

      for (let i = 0;i < 7;i++) {
        tod.add(1, 'day')
        const date = tod.format('Y-M-D')

        const sortHeading = tasks =>
          this.$store.getters.checkMissingIdsAndSortArr(this.calendarOrders[date] || [], tasks)

        const filterFunction = task => this.isTaskShowingOnDate(task, date, true)
        
        arr.push({
          name: utils.getHumanReadableDate(date, this.l),
          id: date,
          showHeading: true,

          sort: sortHeading,
          filter: filterFunction,
          fallbackTask: task => {
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
          filter: task => {
            return this.isTaskInView(task, 'Overdue')
          },
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
    viewFolder() {
      return this.$store.getters['folder/getFoldersByName']([this.viewName])[0]
    },
    notHeadingHeaderView() {
      return this.viewName !== 'Upcoming' && this.viewName !== 'Completed'
    },
    isListType() {
      return !this.isSmart && this.viewList && this.viewType === 'list'
    },
    hasOverdueTasks() {
      return this.getOverdueTasks.length > 0
    },
    getOverdueTasks() {
      return this.tasks.filter(task => this.isTaskInView(task, 'Overdue'))
    },
    viewTag() {
      return this.tags.find(el => el.name === this.viewName)
    },
  },
}

</script>
