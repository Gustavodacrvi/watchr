<template>
  <TaskIcons class="CheckIcon"
    :co='completed'
    :ca='canceled'

    :color='color || circleColor'
    :se='false'
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
    'isSelecting', 'completed',
    'canceled', 'forceDefault', 'color',
    'isItemSelected', 'itemModel',
    
    'name', 'priority', 'id', 'calendar',
  ],
  computed: {
    ...mapState({
      selectedItems: state => state.selectedItems,
    }),

    circleColor() {
      if (!this.priority) return ''
      const obj = {
        'Low priority': 'var(--primary)',
        'Medium priority': 'var(--yellow)',
        'High priority': 'var(--red)',
      }
      return obj[this.priority]
    },
    isSomeday() {
      if (this.itemModel)
        return this.itemModel.calendar && this.itemModel.calendar.type === 'someday'
      return this.calendar && this.calendar.type === 'someday'
    },
    isRepeatingItem() {
      return utilsTask.isRecurringTask(this.calendar)
    },
  }, 
}

</script>
