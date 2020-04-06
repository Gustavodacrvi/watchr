<template>
  <div class="AddTask popup cb shadow rb" :class="layout">
    <TaskEdit
      :quickAdd='true'
      :isAdding='true'
      :listRenderer='false'
      :itemHeight='itemHeight'
      :itemModelFallback='{}'

      placeholder="Task name..."
      notesPlaceholder="Notes..."
      @save='add'
      @cancel="$emit('close')"
    />
  </div>
</template>

<script>

import TaskEdit from "@/components/View/Item/Task.vue"

import { mapGetters } from 'vuex'

export default {
  components: {
    TaskEdit,
  },
  methods: {
    add(obj) {
      if (obj.name) {
        this.$store.dispatch('task/addTask', {...obj})
        this.$store.commit('pushToast', {
          name: `Task successfully added!`,
          seconds: 2,
          type: 'success',
        })
      }
    },
  },
  computed: {
    ...mapGetters(['layout', 'isDesktopBreakPoint', 'itemHeight'])
  }
}

</script>

<style scoped src="@/assets/css/popupAuth.css">
</style>
