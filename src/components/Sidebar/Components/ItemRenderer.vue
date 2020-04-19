<template>
  <div class="ItemRenderer">
    {{name}}
    {{ getItems.length }}
  </div>
</template>

<script>

import { mapGetters, mapState } from 'vuex'

export default {
  props: ['name'],
  computed: {
    ...mapGetters({
      storeTasks: 'task/tasks',
      isTaskInView: 'task/isTaskInView',
    }),

    getItems() {
      return this.storeTasks.filter(t => this.isTaskInView(t, this.name))
    },
  }  
}

</script>
