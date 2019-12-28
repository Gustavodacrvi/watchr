
<template>
  <div class="UserView" :class="[{appbarHided}, platform]">
    <div v-if="isDesktop" class="nav-shadow"></div>
    <div v-if="isDesktop" class="nav" :style="getNavTopPosition">
      <Appbar class="Appbar"
        :value="viewName"
        :view-type="viewType"
        :appbarHided='appbarHided'
        @appbar="toggleAppbar"
        @section="v => section = v"
      />
    </div>
    <div class="cont" :class="platform">
      <ViewControler :isSmart="isSmart"/>
    </div>
  </div>
</template>

<script>

import AppbarVue from '../Appbar/Appbar.vue'
import ViewControlerVue from '../View/Controller/ViewControler.vue'

import { mapGetters, mapState } from 'vuex'

export default {
  props: ['hideNavbar'],
  components: {
    Appbar: AppbarVue,
    ViewControler: ViewControlerVue
  },
  data() {
    return {
      appbarHided: false,
      scrollTop: null,
    }
  },
  created() {
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
  },
  computed: {
    ...mapState(['viewName', 'viewType']),
    ...mapGetters(['platform', 'isDesktop']),
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
      switch (this.viewName) {
        case 'Today': return true
        case 'Calendar': return true
        case 'Pomodoro': return true
        case 'Upcoming': return true
        case 'Someday': return true
        case 'Tomorrow': return true
        case 'Completed': return true
        case 'Inbox': return true
      }
      return false
    },
  },
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
  flex-basis: 425px;
  max-width: 425px;
  flex-grow: 0;
  flex-shrink: 0;
  transition-duration: .6s;
  transition-delay: 0s;
}

.nav {
  position: fixed;
  width: 425px;
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
