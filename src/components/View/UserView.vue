
<template>
  <div class="UserView" :class="[{appbarHided}, platform]">
    <div v-if="isDesktop" class="nav-shadow"></div>
    <div v-if="isDesktop" class="nav" :style="getNavTopPosition">
      <Appbar class="Appbar"
        :value="value"
        :view-type="viewType"
        :appbarHided='appbarHided'
        @appbar="toggleAppbar"
        @section="v => section = v"
      />
    </div>
    <div class="cont" :class="platform">
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
import ViewControlerVue from '../View/Controller/ViewControler.vue'

import { mapGetters } from 'vuex'

export default {
  props: ['hideNavbar'],
  components: {
    Appbar: AppbarVue,
    ViewControler: ViewControlerVue
  },
  data() {
    return {
      viewType: null,
      value: null,
      appbarHided: false,
      scrollTop: null,
      test: false,
    }
  },
  created() {
    setTimeout(() => this.test = true, 2000)
    this.updateViewType(true)
    this.getScrollTop()
    window.addEventListener('scroll', this.getScrollTop)
  },
  methods: {
    getScrollTop() {
      this.scrollTop = window.scrollY
    },
    toggleAppbar(isHided) {
      this.appbarHided = isHided
    },
    updateViewType(saveRoute) {
      const query = this.$route.query
      const keys = Object.keys(query)
      let viewType = keys[0]
      let value = query[viewType]
      const name = this.$route.name
      if (name !== 'menu' && (viewType === undefined || value === undefined)) {
        const view = this.getInitialSmartView
        this.$router.replace(`/user?list=${view}`)
      }
      if (saveRoute) {
        this.value = value
        this.viewType = viewType
        this.$store.commit('navigate', {
          viewName: this.value,
          viewType: this.viewType,
        })
      }
    }
  },
  computed: {
    ...mapGetters(['platform', 'isDesktop', 'getInitialSmartView']),
    getNavTopPosition() {
      let increment = 0
      if (this.hideNavbar) increment = 22
      const app = document.getElementById('app')
      const scroll = this.scrollTop + increment
      if (app) {
        const winHeight = app.offsetHeight
        let top = (75 - scroll) + 'px'
        let height = ((winHeight - 100) + scroll) + 'px'
        if (scroll > 50) {
          top = '30px'
          height = (winHeight - 100 + 45) + 'px'
        }

        return {
          top,
          height,
        }
      }
    },
    isSmart() {
      if (this.viewType === 'search') return true
      if (this.viewType !== 'list') return false
      switch (this.value) {
        case 'Today': return true
        case 'Upcoming': return true
        case 'Someday': return true
        case 'Tomorrow': return true
        case 'Completed': return true
        case 'Inbox': return true
      }
      return false
    },
  },
  watch: {
    $route(newRoute) {
      this.updateViewType(this.isDesktop || newRoute.path !== '/menu')
    }
  }
}

</script>

<style scoped>

.UserView {
  margin: 8px 10px;
  margin-right: 0;
  display: flex;
  justify-content: center;
  transition-delay: .4s;
  flex-grow: 1;
}

.UserView.mobile {
  margin: 0;
}

.nav-shadow {
  flex-basis: 345px;
  max-width: 345px;
  flex-grow: 0;
  flex-shrink: 0;
  transition-duration: .6s;
  transition-delay: 0s;
}

.nav {
  position: fixed;
  width: 345px;
  left: 15px;
  z-index: 4;
}

.cont {
  position: relative;
  flex-basis: 100%;
  flex-grow: 1;
  transition-delay: .4s;
  transition-duration: .6s;
  z-index: 5;
}

.cont.desktop {
  margin-left: 90px;
}

.appbarHided .nav-shadow {
  flex-basis: 0;
  max-width: 0;
  transition-delay: .6s;
  transition-duration: .6s;
}

.appbarHided .cont {
  flex-basis: 925px;
  flex-grow: 0;
  margin-left: 0;
}

</style>
