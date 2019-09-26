<template>
  <div class="TaskView" :class="platform">
    <Header :smart="smart" :value="value" :options="options"/>
    <TaskRenderer
      :tasks='getTasks'
    />
  </div>
</template>

<script>

import HeaderVue from './Header.vue'
import TaskRendererVue from './TaskRenderer.vue'

import { mapGetters, mapState } from 'vuex'

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
            },
            {
              name: 'Sort by priority',
              icon: 'priority',
            },
            {
              name: 'Sort by date',
              icon: 'calendar',
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
  computed: {
    ...mapState({
      tasks: state => state.task.tasks,
    }),
    ...mapGetters(['platform']),
    getTasks() {
      return this.tasks
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
