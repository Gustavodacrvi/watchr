<template>
  <div class="TaskView" :class="platform">
    <Header :smart="smart" :value="value" :options="options"/>
    <TaskRenderer v-if="!headingsRenderer"
      :tasks='getTasks'
      @update='updateIds'
    />
    <HeadingsRenderer v-else
      :tasks='tasks'
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
      options: [
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
        }
      ],
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
  },
  computed: {
    ...mapState({
      tasks: state => state.task.tasks,
      viewOrders: state => state.list.viewOrders,
    }),
    ...mapGetters(['platform']),
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
