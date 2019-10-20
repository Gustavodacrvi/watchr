<template>
  <div class="AddTask popup cb shadow rb" :class="platform">
    <TaskEdit
      :placeholder="l['Task name...']"
      :notesPlaceholder="l['Notes...']"
      @save='add'
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
          name: this.l[`Task successfully added!`],
          seconds: 2,
          type: 'success',
        })
      }
    },
  },
  computed: {
    ...mapGetters(['platform', 'l'])
  }
}

</script>

<style scoped src="@/assets/css/popupAuth.css">
</style>
