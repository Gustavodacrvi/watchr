<template>
  <div class="User" :class="[{appbarHided}, platform]">
    <div v-if="isDesktop" class="nav">
      <Appbar
        :value="value"
        :view-type="viewType"
        @appbar="toggleAppbar"
      />
    </div>
    <div class="cont">
      <TasksView
        :smart="isSmart"
        :view-type="viewType"
        :value="value"
      />
    </div>
  </div>
</template>

<script>

import AppbarVue from '../components/Appbar/Appbar.vue'
import TasksViewVue from '../components/View/TasksView.vue'

import { mapGetters } from 'vuex'

export default {
  components: {
    Appbar: AppbarVue,
    TasksView: TasksViewVue,
  },
  data() {
    return {
      viewType: null,
      value: null,
      appbarHided: false,
    }
  },
  created() {
    this.updateViewType()
  },
  methods: {
    toggleAppbar(isHided) {
      this.appbarHided = isHided
    },
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
  computed: {
    ...mapGetters(['platform', 'isDesktop']),
    isSmart() {
      if (this.viewType !== 'list') return false
      switch (this.value) {
        case 'Today': return true
        case 'Upcoming': return true
        case 'Tomorrow': return true
        case 'Inbox': return true
      }
      return false
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
  justify-content: center;
  transition-delay: .4s;
}

.User.mobile {
  margin: 30px 0;
}

.nav {
  flex-basis: 400px;
  max-width: 400px;
  min-height: 100%;
  transition-duration: .6s;
  transition-delay: 0s;
}

.cont {
  flex-basis: 100%;
  transition-delay: .4s;
  transition-duration: .6s;
}

.appbarHided .nav {
  flex-basis: 0;
  max-width: 0;
  transition-delay: .6s;
  transition-duration: .6s;
}

.appbarHided .cont {
  flex-basis: 925px;
}

</style>
