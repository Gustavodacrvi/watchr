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
import utils from '@/utils/'

import mom from 'moment'

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
    },
    getListHeadingsByView(view) {
      const ts = utilsTask.filterTasksByView(this.tasksWithLists, view)
      if (ts && ts.length > 0) {
        const savedLists = this.lists
        const setOfLists = new Set()
        for (const t of savedLists) {
          if (!setOfLists.has(t)) {
            setOfLists.add(t)
          }
        }
        let lists = Array.from(setOfLists)
        let order = this.viewOrders[view] ? this.viewOrders[view].headings : []
        if (!order) order = []
        lists = utils.checkMissingIdsAndSortArr(order, lists)
        const arr = []
        for (const list of lists) {
          const saveOrder = ids =>
            this.$store.dispatch('list/saveSmartViewHeadingTasksOrder', {
              ids, listId: list.id, smartView: this.viewName,
            })
          const getTasks = () => ts.filter(el => el.list === list.id)
          
          arr.push({
            name: list.name,
            allowEdit: true,
            hideListName: true,
            showHeadingName: true,
            onEdit: (name) => {
              this.$store.dispatch('list/saveList', {
                name, id: list.id,
              })
            },
            order: () => {
              let taskOrder = []
              if (list.smartViewsOrders && list.smartViewsOrders[this.viewName])
                taskOrder = list.smartViewsOrders[this.viewName]
              else
                taskOrder = this.getAllTasksOrderByList(list.id)
              return taskOrder
            },
            filter: (a, h, showCompleted) => {
              let tasks = getTasks()

              if (!showCompleted)
                tasks = utilsTask.filterTasksByCompletion(tasks, true)

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
                    name: 'Sort by date',
                    icon: 'calendar',
                    callback: () => console.log('sort tasks by date'),
                  }
                ]
              },
              {
                name: this.l['Change date'],
                icon: 'calendar',
                callback: () => ({
                  calendar: true,
                  callback: (calendar) => this.$store.dispatch('task/saveTasksById', {
                    ids: getTasks().map(el => el.id),
                    task: {calendar},
                  })
                })
              }
            ],
            id: list.id,
            updateIds: saveOrder,
            onAddTask: (obj) => {
              const t = obj.task
              if (!t.calendar)
                obj.task.calendar = this.getCalObjectByView(this.viewName, t.calendar)
              t.list = list.id
              t.calendar = this.getSpecificDayCalendarObj(mom())
              this.$store.dispatch('task/addTask', {
                ...t, 
              })
            },
            onSortableAdd: (evt, taskIds, type, ids) => {
              this.$store.dispatch('list/moveTasksToList', {
                taskIds, ids, listId: list.id, smartView: this.viewName,
              })
            }
          })
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
      userInfo: state => state.userInfo,      
    }),
    ...mapMutations(['pushToast']),
    ...mapGetters({
      l: 'l',
      isDesktop: 'isDesktop',
      getAllTasksOrderByList: 'list/getAllTasksOrderByList',
      getTasks: 'list/getTasks',
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
        'add-task', 'add-heading', 'update-ids'
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
        'tasks', 'tasksOrder', 'onSortableAdd', 'viewNameValue',
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
      for (let i = 0;i < 31;i++) {
        tod.add(1, 'day')
        const date = tod.format('Y-M-D')
        arr.push({
          name: utils.getHumanReadableDate(date, this.l),
          filter: (tasks) => {
            return utilsTask.filterTasksByDay(tasks.filter(el => {
              return el.calendar && el.calendar.type === 'specific'
            }), mom(date, 'Y-M-D'))
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
      return arr
    },
    completedHeadingsOptions() {
      const arr = []
      const tod = mom()
      for (let i = 0;i < 31;i++) {
        const date = tod.format('Y-M-D')
        arr.push({
          name: utils.getHumanReadableDate(date, this.l),
          filter: (tasks) => {
            tasks = utilsTask.filterTasksByCompletion(tasks, false, mom(date, 'Y-M-D'))
            return tasks.filter(t => {
              const complete = mom(t.completeDate, 'Y-M-D')
              return complete.isSame(mom(date, 'Y-M-D'), 'day')
            })
          },
          id: date,
        })
        tod.subtract(1, 'day')
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
                calendar: true,
                callback: (calendar) => {
                  dispatch('task/saveTasksById', {
                    ids: overIds,
                    task: {calendar},
                  })
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
    tasksWithoutLists() {
      return this.$store.getters['task/tasksWithoutLists'](this.tasks)
    },
    getListTasks() {
      if (this.viewList)
        return this.$store.getters['task/getListTasks'](this.tasksWithLists, this.viewList.id)
      return []
    },
    viewList() {
      return this.getListByName(this.viewName)
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
      return utilsTask.filterTasksByView(this.tasks, 'Overdue')
    },
    viewTag() {
      return this.tags.find(el => el.name === this.viewName)
    },
  },
}

</script>
