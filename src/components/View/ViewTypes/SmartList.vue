<template>
  <ViewRenderer
    :headingsRenderer='isHeadingsRendererType'
    :headingsOptions='headingsOptions'
    :viewName='viewName'
    :viewNameValue='l[viewName]'
    :viewType='viewType'
    :useIcon='true'

    :tasks='getTasks'
    :tasksOrder='tasksOrder'

    @update-ids='updateIds'
    @add-task='addTask'
  />
</template>

<script>

import utilsTask from '@/utils/task'
import utils from '@/utils/'

import mom from 'moment'
import { mapState, mapGetters } from 'vuex'

import ViewTypeMixim from '@/mixins/viewType.js'

export default {
  mixins: [ViewTypeMixim],
  methods: {
    addTask(obj) {
      let calendar = null
      const getCalObj = (m) => {
        return {
          defer: null,
          due: null,

          type: 'specific',
          time: null,
          editDate: mom().format('Y-M-D'),

          specific: m.format('Y-M-D'),
          lastCompleteDate: null,
          periodic: null
        }
      }

      if (this.viewName === 'Today')
        calendar = getCalObj(mom())
      else if (this.viewName === 'Tomorrow')
        calendar = getCalObj(mom().add(1, 'day'))

      obj.task.calendar = calendar
      this.$store.dispatch('list/addTaskByIndexSmart', {
        ...obj, list: this.viewName,
      })
    },
    updateIds(ids) {
      this.$store.dispatch('list/updateViewOrder', {
        view: this.viewName,
        ids,
      })
    },
  },
  computed: {
    ...mapState({
      tasks: state => state.task.tasks,
      viewOrders: state => state.list.viewOrders,      
    }),
    ...mapGetters(['l']),
    tasksOrder() {
      const o = this.viewOrders[this.viewName]
      if (o) return o
      return []
    },
    getTasks() {
      return utilsTask.filterTasksByView(this.tasks, this.viewName)
    },
    getOverdueTasks() {
      return utilsTask.filterTasksByView(this.tasks, 'Overdue')
    },
    upcomingView() {
      return this.viewName === 'Upcoming'
    },
    hasAtLeastOneOverdue() {
      return this.viewName === 'Today' && this.getOverdueTasks.length > 0
    },
    isHeadingsRendererType() {
      return this.upcomingView || this.hasAtLeastOneOverdue
    },
    upcomingHeadingsOptions() {
      const arr = []
      const tod = mom()
      for (let i = 0;i < 31;i++) {
        tod.add(1, 'day')
        const date = tod.format('Y-M-D')
        arr.push({
          name: utils.getHumanReadableDate(date),
          filter: (tasks) => {
            return utilsTask.filterTasksByDay(tasks.filter(el => {
              return el.calendar && el.calendar.type === 'specific'
            }), mom(date, 'Y-M-D'))
          },
          id: date,
          onAdd: (evt) => {
            this.$store.dispatch('task/saveTask', {
              id: evt.item.dataset.id,
              calendar: {
                defer: null,
                due: null,
  
                type: 'specific',
                time: null,
                editDate: mom().format('Y-M-D'),
  
                specific: date,
                weekly: null,
                lastCompleteDate: null,
                periodic: null
              }
            })
          },
        })
      }
      return arr
    },
    todayHeadingsOptions() {
      const dispatch = this.$store.dispatch
      const saveTasksDay = (ids, mom) => {
        dispatch('task/saveTasksById', {
          ids, task: {calendar: this.$store.getters['task/getSpecificDayCalendarObj'](mom)}
        })
      }
      const overIds = this.getOverdueTasks.map(el => el.id)
      return [
        {
          name: 'Overdue',
          id: 'overdue',
          filter: (tasks) => this.getOverdueTasks,
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
          name: 'Today',
          id: 'todya',
          filter: (tasks) => this.getTasks,
        },
      ]
    },
    headingsOptions() {
      if (this.upcomingView) return this.upcomingHeadingsOptions
      return this.todayHeadingsOptions
    },
  }
}

</script>
