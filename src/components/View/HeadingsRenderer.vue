<template>
  <div class="HeadingsRenderer">
    <template v-for="h in headings">
      <HeadingApp v-if="getTasks(tasks, h).length > 0" :key="h.id"
        :name='h.name'
      >
        <TaskRenderer
          :tasks='getTasks(tasks, h)'
        />
      </HeadingApp>
    </template>
  </div>
</template>

<script>

import HeadingVue from './Heading.vue'
import TaskRendererVue from './TaskRenderer.vue'

const lastHeading = {
  id: null,
  tasks: null,
}

export default {
  props: ['headings', 'tasks'],
  components: {
    HeadingApp: HeadingVue,
    TaskRenderer: TaskRendererVue,
  },
  methods: {
    getTasks(tasks, h) {
      if (h.id === lastHeading.id) return lastHeading.tasks
      lastHeading.tasks = h.filter(tasks, h)
      lastHeading.id = h.id
      return lastHeading.tasks
    },
  },
}

</script>
