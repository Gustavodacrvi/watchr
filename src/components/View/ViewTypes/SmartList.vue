<template>
  <ViewRenderer
    :headingsRenderer='isHeadingsRendererType'
    :headingsOptions='headingsOptions'
    :viewName='viewName'
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
import { mapState } from 'vuex'

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
    tasksOrder() {
      const o = this.viewOrders[this.viewName]
      if (o) return o
      return []
    },
    getTasks() {
      return utilsTask.filterTasksByView(this.tasks, this.viewName)
    },
    getUpcomingTasks() {
      return utilsTask.filterTasksByView(this.tasks, 'Overdue')
    },
    upcomingView() {
      return this.viewName === 'Upcoming'
    },
    isHeadingsRendererType() {
      console.log(this.getUpcomingTasks.length)
      return this.upcomingView
    },
    headingsOptions() {
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
  }
}

</script>
