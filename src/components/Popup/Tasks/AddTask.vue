<template>
  <div class="AddTask popup cb shadow rb" :class="platform">
    <TaskEdit
      placeholder="Task name..."
      notesPlaceholder="Notes..."
      @save='add'
      @cancel="$emit('close')"
    />
  </div>
</template>

<script>

import EditVue from '../../View/Tasks/Edit.vue'

import { mapGetters } from 'vuex'

export default {
  components: {
    TaskEdit: EditVue,
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
    ...mapGetters(['platform', 'isDesktop'])
  }
}

</script>

<style scoped src="@/assets/css/popupAuth.css">
</style>
