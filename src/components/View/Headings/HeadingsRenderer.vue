<template>
  <div class="HeadingsRenderer">
    <transition-group
      @leave='leave'
      @enter='enter'
    >
      <template v-for="h in headings">
        <HeadingApp v-if="getTasks(tasks, h).length > 0" :key="h.id"
          :name='h.name'
          :color='h.color ? h.color : ""'
          :options='h.options ? h.options : []'
        >
          <TaskRenderer
            :tasks='getTasks(tasks, h)'
            :showCompleted='showCompleted'
            :view='view'
            :onAdd='h.onAdd'
          />
        </HeadingApp>
      </template>
    </transition-group>
  </div>
</template>

<script>

import HeadingVue from './Heading.vue'
import TaskRendererVue from './../Tasks/TaskRenderer.vue'

const lastHeading = {
  id: null,
  tasks: null,
}

export default {
  props: ['headings', 'tasks', 'showCompleted', 'view'],
  components: {
    HeadingApp: HeadingVue,
    TaskRenderer: TaskRendererVue,
  },
  methods: {
    leave(el) {
      const header = el.getElementsByClassName('header-wrapper')[0]
      const s = header.style      
      s.transitionDuration = '0s'
      s.height = '45px'
      setTimeout(() => {
        s.transitionDuration = '.3s'
        s.height = '0px'
      })
    },
    enter(el) {
      const header = el.getElementsByClassName('header-wrapper')[0]
      const s = header.style
      s.transitionDuration = '0s'
      s.height = '0px'
      setTimeout(() => {
        s.transitionDuration = '.3s'
        s.height = '45px'
      })
    },
    getTasks(tasks, h) {
      if (h.id === lastHeading.id) return lastHeading.tasks
      lastHeading.tasks = h.filter(tasks, h)
      lastHeading.id = h.id
      return lastHeading.tasks
    },
  },
}

</script>
