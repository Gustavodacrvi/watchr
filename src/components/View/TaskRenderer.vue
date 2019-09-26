<template>
  <div class="TaskRenderer">
    <transition-group>
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
}

</script>

<style scoped>

.TaskRenderer {
  margin-top: 16px;
}

</style>
