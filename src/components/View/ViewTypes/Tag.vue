<template>
  <ViewRenderer
    :viewName='viewName'
    :viewType='viewType'
    :tasks='getTasks'

    @add-task='addTask'
  />
</template>


<script>

import ViewTypeMixim from '@/mixins/viewType.js'
import { mapState } from 'vuex'

export default {
  mixins: [ViewTypeMixim],
  methods: {
    addTask(obj) {
      if (this.viewTag) {
        obj.task.tags = [this.viewTag.id]
        this.$store.dispatch('task/addTask', {
          ...obj.task,
        })  
      }
    },
  },
  computed: {
    ...mapState({
      tags: state => state.tag.tags,
      tasks: state => state.task.tasks,
    }),
    viewTag() {
      return this.tags.find(el => el.name === this.viewName)
    },
    getTasks() {
      if (this.viewTag)
        return this.tasks.filter(el => el.tags.includes(this.viewTag.id))
      return []
    },
  },
}

</script>
