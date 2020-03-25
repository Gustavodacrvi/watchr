<template>
  <TaskIcons
    :co='completed'
    :ca='canceled'

    :color='circleColor'
    :se='isSelecting'
    :ac='isItemSelected'
    :so='isSomeday'
    :re='isRepeatingItem'
  />
</template>

<script>

import TaskIcons from '../../../Tasks/TaskIcons.vue'

import utilsTask from '@/utils/task'

import { mapState } from 'vuex'

export default {
  components: {
    TaskIcons,
  },
  props: [
    'movingItem', 'isSelecting', 'completed',
    'canceled',
    
    'name', 'priority', 'id', 'calendar',
  ],
  computed: {
    ...mapState({
      selectedItems: state => state.selectedItems,
    }),

    circleColor() {
      if (!this.priority) return ''
      const obj = {
        'Low priority': 'var(--green)',
        'Medium priority': 'var(--yellow)',
        'High priority': 'var(--red)',
      }
      return obj[this.priority]
    },
    isItemSelected() {
      return !this.movingItem && this.selectedItems.includes(this.id)
    },
    isSomeday() {
      return this.calendar && this.calendar.type === 'someday'
    },
    isRepeatingItem() {
      return utilsTask.isRecurringTask(this.calendar)
    },
  }, 
}

</script>
