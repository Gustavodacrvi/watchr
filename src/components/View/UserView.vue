<template>
  <div class="UserView" :class="[{appbarHided}, platform]">
    <div v-if="isDesktop" class="nav">
      <Appbar class="Appbar"
        :value="value"
        :view-type="viewType"
        :appbarHided='appbarHided'
        @appbar="toggleAppbar"
        @section="v => section = v"
      />
    </div>
    <div class="cont">
      <ViewControler
        :isSmart="isSmart"
        :viewType='viewType'
        :viewName='value'
      />
    </div>
  </div>
</template>

<script>

import AppbarVue from '../Appbar/Appbar.vue'
import ViewControlerVue from '../View/ViewControler.vue'

import { mapGetters } from 'vuex'

export default {
  components: {
    Appbar: AppbarVue,
    ViewControler: ViewControlerVue
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
        case 'Completed': return true
        case 'Inbox': return true
      }
      return false
    },
  },
  watch: {
    $route() {
      this.updateViewType()
    }
  }
}

</script>

<style scoped>

.UserView {
  margin: 8px 60px;
  display: flex;
  justify-content: center;
  transition-delay: .4s;
  flex-grow: 1;
}

.UserView.mobile {
  margin: 0;
}

.nav {
  flex-basis: 400px;
  max-width: 400px;
  min-height: 100%;
  transition-duration: .6s;
  transition-delay: 0s;
}

.Appbar {
  position: sticky;
  top: 20px;
}

.cont {
  position: relative;
  flex-basis: 100%;
  flex-grow: 1;
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
  flex-grow: 0;
}

</style>
