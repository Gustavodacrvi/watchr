<template>
  <div class="TaskView" :class="platform">
    <Header :smart="smart" :value="value" :options="options"/>
    <TaskRenderer
      :tasks='getTasks'
      @update='updateOrder'
    />
  </div>
</template>

<script>

import HeaderVue from './Header.vue'
import TaskRendererVue from './TaskRenderer.vue'

import { mapGetters, mapState } from 'vuex'

import utilsTask from '@/utils/task'
import utils from '@/utils/'

export default {
  props: ['smart', 'viewType', 'value'],
  components: {
    Header: HeaderVue,
    TaskRenderer: TaskRendererVue
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
      let tasks = this.getTasks.slice()
      tasks = utilsTask.sortTasksByDate(tasks)
      this.updateIds(tasks.map(el => el.id))
    },
    updateOrder(ids) {
      this.updateIds(ids)
    }
  },
  computed: {
    ...mapState({
      tasks: state => state.task.tasks,
      viewOrders: state => state.list.viewOrders,
    }),
    ...mapGetters(['platform']),
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
