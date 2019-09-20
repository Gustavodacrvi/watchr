<template>
  <div class="User">
    <div class="nav">
      <Appbar :value="value" :view-type="viewType"/>
    </div>
    <div class="cont">
      <TasksView
        :smart="true"
        :view-type="viewType"
        :value="value"
      />
    </div>
  </div>
</template>

<script>

import AppbarVue from '../components/NavBar/Appbar.vue'
import TasksViewVue from '../components/View/TasksView.vue'

export default {
  components: {
    Appbar: AppbarVue,
    TasksView: TasksViewVue,
  },
  data() {
    return {
      viewType: null,
      value: null,
    }
  },
  created() {
    this.updateViewType()
  },
  methods: {
    updateViewType() {
      const query = this.$route.query
      const keys = Object.keys(query)
      let viewType = keys[0]
      let value = query[viewType]
      if (viewType === undefined || value === undefined)
        this.$router.replace('/user?list=Today')
      this.value = value
      this.viewType = viewType
    }
  },
  watch: {
    $route() {
      this.updateViewType()
    }
  }
}

</script>

<style scoped>

.User {
  margin: 8px 60px;
  display: flex;
}

.nav {
  flex-basis: 400px;
  min-height: 100%;
}

.cont {
  flex-basis: 100%;
}

</style>
