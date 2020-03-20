<template>
  <div class="Cards">

    <Card v-for='t in getCards' :key="t.id"
      v-bind="t.task"
      :duration="t.task.taskDuration"
      :time="t.task.calendar.time"
      :collisions='t.collisions'
      :task='t.task'

      :timelineHeight='height'

      @dragging='dragg'
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
  data() {
    return {
      dragging: null,
    }
  },
  methods: {
    dragg(v) {
      this.dragging = v
    },
    comesBeforeThan(targetId, testId) {
      const arr = this.timeArr
      
      for (const {id} of arr)
        if (id === targetId)
          return true
        else if (id === testId)
          return false

    },
  },
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
    getCards() {
      const tasks = this.hasDurationAndTimeTasks
      const collisions = this.collisions
      const cards = []

      for (let i = 0;i < tasks.length;i++)
        cards.push({
          task: tasks[i],
          collisions: collisions[i]
        })
      
      return cards
    },
    timeArr() {
      return this.tasks.map(t => {
        if (!this.dragging)
          return this.getTaskStartAndEnd(t)
        
        return this.getTaskStartAndEnd(
          this.dragging.id === t.id ? {
            ...t,
            taskDuration: this.dragging.taskDuration,
            calendar: {
              ...t.calendar,
              time: this.dragging.time,
            },
          } : t)
      })
    },
    collisions() {
      const arr = this.shallowCollisions

      const getTotal = ({target, ids}) => {
        return ids.reduce((tot, id) => {
          const next = arr.find(col => col.target === id)

          return next.ids.length === 0 ? tot : getTotal(next) + tot
        }, 0) + ids.length
      }
      
      return arr.map(getTotal)
    },
    shallowCollisions() {
      const arr = this.timeArr

      return arr.map(target => {
        const {start: strStart, end: strEnd, id} = target

        const start = mom(target.start, 'HH:mm')
        const end = mom(target.end, 'HH:mm')

        return {
          target: id,
          ids: arr.reduce((ids, taskProperties) => {
            const tryCollide = () => {
              if (taskProperties.id === id)
                return false
              
              const test = {
                end: mom(taskProperties.end, 'HH:mm'),
                start: mom(taskProperties.start, 'HH:mm'),
              }
    
              if (
                start.isBefore(test.end, 'minute') &&
                start.isAfter(test.start, 'minute')
              )
                return true
    
              if (
                taskProperties.start === strStart &&
                end.isBefore(test.end)
              )
                return true
    
              if (
                taskProperties.start === strStart &&
                taskProperties.end === strEnd &&
                this.comesBeforeThan(id, taskProperties.id)
              )
                return true
            }

            return tryCollide() ? [...ids, taskProperties.id] : ids

          }, []),
        }
      })
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
