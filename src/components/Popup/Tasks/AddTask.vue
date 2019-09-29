<template>
  <div class="AddTask popup cb shadow rb" :class="platform">
    <div class="title tac">
      <h2 class="pc">Add task</h2>
    </div>
    <div class="content">
      <TaskEdit
        placeholder="Task name..."
        @save='add'
      />
    </div>
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
      if (obj.name)
        this.$store.dispatch('task/addTask', {...obj})
    },
  },
  computed: {
    ...mapGetters(['platform'])
  }
}

</script>

<style scoped src="@/assets/css/popupAuth.css">
</style>
