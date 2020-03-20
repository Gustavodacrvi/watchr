<template>
  <div class="Cards">

    <Card v-for='t in hasDurationAndTimeTasks' :key="t.id"
      v-bind="t"
      :duration="t.taskDuration"
      :time="t.calendar.time"
      :timeArr='timeArr'
      :task='t'

      :timelineHeight='height'
    />
    
  </div>
</template>

<script>

import { mapGetters } from 'vuex'

import mom from 'moment'

import Card from './Card.vue'

export default {
  components: {
    Card,
  },
  props: ['date', 'height'],
  computed: {
    ...mapGetters({
      storeTasks: 'task/tasks',
      isTaskShowingOnDate: 'task/isTaskShowingOnDate',
      hasDurationAndTime: 'task/hasDurationAndTime',
      getTaskStartAndEnd: 'task/getTaskStartAndEnd',
    }),

    hasDurationAndTimeTasks() {
      return this.tasks.filter(
        t => this.hasDurationAndTime(t)
      )
    },
    timeArr() {
      return this.tasks.map(this.getTaskStartAndEnd)
    },
    tasks() {
      return this.storeTasks.filter(
        t => this.isTaskShowingOnDate(t, this.date, false, true)
      )
    },
  },
}

</script>

<style scoped>

.Cards {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1;
}

</style>
