<template>
  <div v-if="!isDesktop" class="AddTask popup cb shadow rb" :class="platform">
    <div class="title tac">
      <h2 class="pc">{{ l['Add task'] }}</h2>
    </div>
    <div class="content">
      <TaskEdit
        :noShadow='true'
        :placeholder="l['Task name...']"
        :notesPlaceholder="l['Notes...']"
        @save='add'
      />
    </div>
  </div>
  <div v-else class="AddTask popup cb shadow rb" :class="platform">
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
    ...mapGetters(['platform', 'l', 'isDesktop'])
  }
}

</script>

<style scoped src="@/assets/css/popupAuth.css">
</style>
