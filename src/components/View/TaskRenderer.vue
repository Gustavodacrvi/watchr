<template>
  <div class="TaskRenderer">
    <transition-group
      @enter='enter'
      @leave='leave'
    >
      <Task v-for="t of tasks" :key="t.id"
        :task='t'
      />
    </transition-group>
  </div>
</template>

<script>

import TaskVue from './Tasks/Task.vue'

export default {
  props: ['tasks'],
  components: {
    Task: TaskVue,
  },
  methods: {
    enter(el) {
      el.transitionDuration = '0s'
      el.classList.add('task-hided')
      setTimeout(() => {
        el.transitionDuration = '.3s'
        el.classList.remove('task-hided')
      })
    },
    leave(el) {
      el.classList.add('task-hided')
    },
  }
}

</script>

<style scoped>

.TaskRenderer {
  margin-top: 16px;
}

.task-hided {
  opacity: 0;
  height: 0;
}

</style>
