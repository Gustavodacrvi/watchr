<template>
  <ViewRenderer
    v-bind="{ ...$props, ...props }"
    v-on="listeners"

    :prefix='prefix'

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

import mom from 'moment/src/moment'

import mixins from './controlerModules'

export default {
  mixins,
  props: ['isSmart', 'viewType', 'viewName'],
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
    getListHeadingsByView(view) {
      const ts = this.filterTasksByView(this.tasksWithListsOrFolders, view)
      if (ts && ts.length > 0) {
        const savedLists = this.lists.slice()
        const savedFolders = this.folders.slice()
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
        let lists = Array.from(setOfLists).map(l => ({...l}))
        lists.forEach(l => l.smartViewControllerType = 'list')
        let folders = Array.from(setOfFolders).map(t => ({...t}))
        folders.forEach(f => f.smartViewControllerType = 'folder')

        let order = this.viewOrders[view] ? this.viewOrders[view].headings : []
        if (!order) order = []
        const headings = utils.checkMissingIdsAndSortArr(order, [...folders, ...lists])

        const arr = []
        for (const viewHeading of headings) {
          if (viewHeading.smartViewControllerType === 'list') {
            const list = viewHeading
            const saveOrder = ids =>
              this.$store.dispatch('list/saveSmartViewHeadingTasksOrder', {
                ids, listId: list.id, smartView: this.viewName,
              })
            const getTasks = () => ts.filter(el => el.list === list.id)
            let taskOrder = []
            if (list.smartViewsOrders && list.smartViewsOrders[this.viewName])
              taskOrder = list.smartViewsOrders[this.viewName]
            else
              taskOrder = this.getAllTasksOrderByList(list.id)
            
            arr.push({
              name: list.name,
              allowEdit: true,
              hideListName: true,
              hideFolderName: true,
              showHeadingName: true,
              onEdit: (name) => {
                this.$store.dispatch('list/saveList', {
                  name, id: list.id,
                })
              },
              order: () => taskOrder,
              progress: this.$store.getters['list/pieProgress'](this.tasks, list.id, this.isTaskCompleted),
              filter: (a, h, showCompleted) => {
                let tasks = getTasks()

                if (!showCompleted) {
                  tasks = this.filterTasksByCompletion(tasks, true)
                }
  
                return tasks
              },
              options: [
                {
                  name: 'Edit list',
                  icon: 'pen',
                  callback: (j, vm, l) => {
                    vm.$emit('edit')
                  }
                },
                {
                  name: this.l['Sort tasks'],
                  icon: 'sort',
                  callback: () => [
                    {
                      name: this.l['Sort by name'],
                      icon: 'sort-name',
                      callback: () => {
                        const tasks = getTasks()
                        tasks.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
                        saveOrder(tasks.map(el => el.id))
                      },
                    },
                    {
                      name: this.l['Sort by priority'],
                      icon: 'priority',
                      callback: () => {
                        const tasks = utilsTask.sortTasksByPriority(getTasks())
                        saveOrder(tasks.map(el => el.id))
                      },
                    },
                    {
                      name: this.l['Sort by creation date'],
                      icon: 'calendar',
                      callback: () => {
                        const tasks = utilsTask.sortTasksByTaskDate(getTasks())
                        saveOrder(tasks.map(el => el.id))
                      },
                    },
                  ]
                },
                {
                  name: this.l['Change date'],
                  icon: 'calendar',
                  callback: () => ({
                    comp: "CalendarPicker",
                    content: {callback: (calendar) => this.$store.dispatch('task/saveTasksById', {
                      ids: getTasks().map(el => el.id),
                      task: {calendar},
                    })}
                  })
                }
              ],
              id: list.id,
              updateIds: saveOrder,
              onAddTask: (obj) => {
                const t = obj.task
                if (!t.calendar) {
                  obj.task.calendar = this.getCalObjectByView(this.viewName, t.calendar)
                }
                t.list = list.id
                t.folder = null
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
            const saveOrder = ids =>
              this.$store.dispatch('folder/saveSmartViewHeadingTasksOrder', {
                ids, folderId: folder.id, smartView: this.viewName,
              })
            const getTasks = () => ts.filter(el => el.folder === folder.id)
            let taskOrder = []
            if (folder.smartViewsOrders && folder.smartViewsOrders[this.viewName])
              taskOrder = folder.smartViewsOrders[this.viewName]
            else
              taskOrder = this.getFolderTaskOrderById(folder.id)
            
            arr.push({
              name: folder.name,
              allowEdit: true,
              hideListName: true,
              hideFolderName: true,
              showHeadingName: true,
              onEdit: name => {
                this.$store.dispatch('folder/saveFolder', {
                  name, id: folder.id,
                })
              },
              order: () => taskOrder,
              icon: 'folder',
              filter: (a, h, showCompleted) => {
                let tasks = getTasks()
  
                if (!showCompleted)
                  tasks = this.filterTasksByCompletion(tasks, true)
  
                return tasks
              },
              options: [
                {
                  name: this.l['Sort tasks'],
                  icon: 'sort',
                  callback: () => [
                    {
                      name: this.l['Sort by name'],
                      icon: 'sort-name',
                      callback: () => {
                        const tasks = getTasks()
                        tasks.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
                        saveOrder(tasks.map(el => el.id))
                      },
                    },
                    {
                      name: this.l['Sort by priority'],
                      icon: 'priority',
                      callback: () => {
                        const tasks = utilsTask.sortTasksByPriority(getTasks())
                        saveOrder(tasks.map(el => el.id))
                      },
                    },
                    {
                      name: this.l['Sort by creation date'],
                      icon: 'priority',
                      callback: () => {
                        const tasks = utilsTask.sortTasksByTaskDate(getTasks())
                        saveOrder(tasks.map(el => el.id))
                      },
                    },
                  ]
                },
                {
                  name: this.l['Change date'],
                  icon: 'calendar',
                  callback: () => ({
                    comp: "CalendarPicker",
                    content: {callback: (calendar) => this.$store.dispatch('task/saveTasksById', {
                      ids: getTasks().map(el => el.id),
                      task: {calendar},
                    })}
                  })
                }
              ],
              id: folder.id,
              updateIds: saveOrder,
              onAddTask: (obj) => {
                const t = obj.task
                if (!t.calendar) {
                  obj.task.calendar = this.getCalObjectByView(this.viewName, t.calendar)
                }
                t.folder = folder.id
                t.list = null
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
      }

      return []
    },
  },
  computed: {
    ...mapState({
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
      getTasks: 'list/getTasks',
      filterTasksByPeriod: 'task/filterTasksByPeriod',
      filterTasksByView: 'task/filterTasksByView',
      filterTasksByCompletion: 'task/filterTasksByCompletion',
      isTaskCompleted: 'task/isTaskCompleted',
      getTagsById: 'tag/getTagsById',
      filterTasksByDay: 'task/filterTasksByDay',
      getListsById: 'list/getListsById',
      getListByName: 'list/getListByName',
      getSpecificDayCalendarObj: 'task/getSpecificDayCalendarObj',
      getTasksWithHeading: 'task/getTasksWithHeading',
    }),
    viewOrders() {
      if (this.userInfo) return this.userInfo.viewOrders
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
        'save-header-name', 'save-notes', 'update-heading-ids',
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
        'icon', 'illustration', 'showHeader', 'showEmptyHeadings',
        'headingEdit', 'headerOptions', 'notes', 'progress', 'headingsOptions',
        'tasks', 'tasksOrder', 'onSortableAdd', 'viewNameValue', 'headerDates',
        'headerTags', 'headerCalendar', 'taskCompletionCompareDate', 'files',
        'headingsPagination',
      ]
      const obj = {}

      for (const v of props)
        obj[v] = this[p + v]
      
      obj['showEmptyHeadings'] = this['isListType']
      obj['showHeader'] = this['isListType']
      obj['notes'] = this[p + 'getViewNotes']
      obj['progress'] = this[p + 'getPieProgress']
      obj['tasks'] = this[p + 'getTasks']
      
      return obj
    },
    upcomingHeadingsOptions() {
      const arr = []
      const tod = mom()
      const calObj = (date) => ({
        defer: null,
        due: null,

        type: 'specific',
        time: null,
        editDate: mom().format('Y-M-D'),

        specific: date,
        weekly: null,
        lastCompleteDate: null,
        periodic: null
      })
      const filtered = this.tasks.filter(el => {
        return el.calendar && el.calendar.type === 'specific'
      })
      for (let i = 0;i < 7;i++) {
        tod.add(1, 'day')
        const date = tod.format('Y-M-D')
        arr.push({
          name: utils.getHumanReadableDate(date, this.l),
          order: ts => utilsTask.sortTasksByTaskDate(ts),
          filter: () => {
            return this.filterTasksByDay(filtered, date, true)
          },
          id: date,
          onAddTask: obj => {
            const date = obj.header.id
            this.$store.dispatch('task/addTask', {
              ...obj.task, calendar: calObj(date)
            })
          },
          onSortableAdd: evt => {
            const items = evt.items
            if (items.length === 0) items.push(evt.item)
            this.$store.dispatch('task/saveTasksById', {
              ids: items.map(el => el.dataset.id),
              task: {calendar: calObj(date)},
            })
          },
        })
      }
      const in7Days = mom().add(7, 'd')
      const after7DaysTasks = filtered.filter(el => {
        return in7Days.isBefore(mom(el.calendar.specific, 'Y-M-D'), 'day')
      })
      // this month
      arr.push({
        name: this.l['This month'],
        calendarStr: true,
        order: ts => utilsTask.sortTasksByTaskDate(ts),
        filter: () => {
          return this.filterTasksByPeriod(after7DaysTasks, tod, 'month', true)
        },
        id: 'this month'
      })
      // this year
      const inOneMonth = mom().add(1, 'M').startOf('month')
      const inOneMonthTasks = after7DaysTasks.filter(el => {
        return inOneMonth.isBefore(mom(el.calendar.specific, 'Y-M-D'), 'day')
      })
      arr.push({
        name: this.l['This year'],
        calendarStr: true,
        order: ts => utilsTask.sortTasksByTaskDate(ts),
        filter: () => {
          return this.filterTasksByPeriod(inOneMonthTasks, tod, 'year', true)
        },
        id: 'this year'
      })
      // next years
      const inOneYear = mom().add(1, 'y').startOf('year')
      const inOneYearTasks = inOneMonthTasks.filter(el => {
        return inOneYear.isBefore(mom(el.calendar.specific, 'Y-M-D'), 'day')
      })
      arr.push({
        name: this.l['Next years'],
        calendarStr: true,
        order: ts => utilsTask.sortTasksByTaskDate(ts),
        filter: () => {
          return inOneYearTasks
        },
        id: 'nextYears',
      })
      return arr
    },
    completedHeadingsOptions() {
      const arr = []
      const filtered = this.filterTasksByCompletion(this.tasks, false, mom())
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

      const cache = {}
      for (const date of dates) {
        arr.push({
          name: utils.getHumanReadableDate(date, this.l),
          order: ts => utilsTask.sortTasksByTaskDate(ts, 'fullCompleteDate'),
          filter: () => {
            if (cache[date]) return cache[date]
            const result = this.filterTasksByDay(filtered, date, true)
            cache[date] = result
            return result
          },
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
      const overIds = this.getOverdueTasks.map(el => el.id)
      return [
        {
          name: l['Overdue'],
          id: 'overdue',
          filter: () => this.getOverdueTasks,
          color: 'var(--red)',
          options: [
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
        {
          name: l['Today'],
          id: 'todya',
          filter: (tasks) => this[this.prefix + 'getTasks'],
        },
      ]
    },

    getRootTasksOfList() {
      if (this.viewList)
        return this.$store.getters['task/getRootTasksOfList'](this.getListTasks, this.viewList)
      return []
    },
    tasksWithLists() {
      return this.$store.getters['task/tasksWithLists'](this.tasks)
    },
    tasksWithListsOrFolders() {
      return this.$store.getters['task/tasksWithListsOrFolders'](this.tasks)
    },
    tasksWithoutLists() {
      return this.$store.getters['task/tasksWithoutLists'](this.tasks)
    },
    tasksWithoutListsAndFolders() {
      return this.$store.getters['task/tasksWithoutListsAndFolders'](this.tasks)
    },
    getListTasks() {
      if (this.viewList)
        return this.$store.getters['task/getListTasks'](this.tasksWithLists, this.viewList.id)
      return []
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
      return this.filterTasksByView(this.tasks, 'Overdue')
    },
    viewTag() {
      return this.tags.find(el => el.name === this.viewName)
    },
  },
}

</script>
