<template>
  <div class="TaskView" :class="platform">
    <Header :smart="smart" :value="value" :options="options"/>
    <TaskRenderer v-if="!headingsRenderer"
      :tasks='getTasks'
      :showCompleted='showCompleted'
      :view='value'
      @update='updateIds'
    />
    <HeadingsRenderer v-else
      :tasks='tasks'
      :showCompleted='showCompleted'
      :view='value'
      :headings='upcomingHeadings'
    />
  </div>
</template>

<script>

import HeaderVue from './Header.vue'
import TaskRendererVue from './TaskRenderer.vue'
import HeadingsRendererVue from './HeadingsRenderer.vue'

import { mapGetters, mapState } from 'vuex'

import utilsTask from '@/utils/task'
import utils from '@/utils/index.js'
import mom from 'moment'

export default {
  props: ['smart', 'viewType', 'value', 'headingsRenderer'],
  components: {
    Header: HeaderVue,
    TaskRenderer: TaskRendererVue,
    HeadingsRenderer: HeadingsRendererVue
  },
  data() {
    return {
      showCompleted: false,
    }
  },
  methods: {
    updateIds(ids) {
      if (this.smart) {
        this.$store.dispatch('list/updateViewOrder', {
          view: this.value,
          ids,
        })
      }
    },
    sortByName() {
      const tasks = this.getTasks.slice()
      tasks.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
      this.updateIds(tasks.map(el => el.id))
    },
    sortByPriority() {
      let tasks = this.getTasks.slice()
      tasks = utilsTask.sortTasksByPriority(tasks)
      this.updateIds(tasks.map(el => el.id))
    },
    sortByDate() {
      // TODO
/*       let tasks = this.getTasks.slice()
      tasks = utilsTask.sortTasksByDate(tasks)
      this.updateIds(tasks.map(el => el.id)) */
    },
    toggleCompleted() {
      this.showCompleted = !this.showCompleted
    },
    saveDates(date) {
      this.$store.dispatch('task/saveTasksById', {
        ids: this.selectedTasks,
        task: {calendar: date},
      })
    },
  },
  computed: {
    ...mapState({
      tasks: state => state.task.tasks,
      viewOrders: state => state.list.viewOrders,
      selectedTasks: state => state.selectedTasks,
    }),
    ...mapGetters(['platform']),
    options() {
      const dispatch = this.$store.dispatch
      const ids = this.selectedTasks

      const savePri = (pri) => {
        dispatch('task/saveTasksById', {ids, task: {priority: pri}})
      }
      
      if (ids.length === 0) {
        const opt = [
          {
            name: 'Sort tasks',
            icon: 'sort',
            callback: () => [
              {
                name: 'Sort by name',
                icon: 'sort-name',
                callback: () => this.sortByName()
              },
              {
                name: 'Sort by priority',
                icon: 'priority',
                callback: () => this.sortByPriority()
              },
              {
                name: 'Sort by date',
                icon: 'calendar',
                callback: () => this.sortByDate(),
              }
            ],
          },
          {
            name: 'Show completed',
            icon: 'completed',
            callback: () => this.toggleCompleted()
          }
        ]
        if (this.showCompleted) opt[1].name = 'Hide completed'
        return opt
      } else {
        return [
          {
            icon: 'priority',
            name: 'Change priority of tasks',
            callback: () => [
              {
                name: 'No priority',
                icon: 'priority',
                callback: () => savePri('')
              },
              {
                name: 'Low priority',
                icon: 'priority',
                color: 'var(--green)',
                callback: () => savePri('Low priority')
              },
              {
                name: 'Medium priority',
                icon: 'priority',
                color: 'var(--yellow)',
                callback: () => savePri('Medium priority')
              },
              {
                name: 'High priority',
                icon: 'priority',
                color: 'var(--red)',
                callback: () => savePri('High priority')
              }
            ]
          },
          {
            name: 'Change date',
            icon: 'calendar',
            callback: () => {return {calendar: true, callback: this.saveDates}}
          },
          {
            name: 'Delete tasks',
            icon: 'trash',
            callback: () => dispatch('task/deleteTasks', ids)
          },
        ]
      }
    },
    upcomingHeadings() {
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
    getTaskOrder() {
      if (this.smart) {
        return this.viewOrders[this.value]
      }
    },
    getTasks() {
      let tasks = this.tasks
      const order = this.getTaskOrder
      if (this.smart) {
        tasks = utilsTask.filterTasksByView(tasks, this.value)
        tasks = utils.checkMissingIdsAndSortArr(order, tasks)
      }
      return tasks
    },
  },
}

</script>

<style scoped>

.TaskView {
  margin: 0 60px;
}

.TaskView.mobile {
  margin: 0 8px;
}

</style>
