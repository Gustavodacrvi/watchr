
<template>
  <div class="UserView" :class="[{appbarHided}, platform]"
    @pointerup='pointerup'
    @pointermove='handlePointermove'
  >
    <div v-if="isDesktop"
      class="nav-shadow"
      :class="{pressingHandle}"
      :style="{width: navWidth, maxWidth: navWidth, flexBasis: navWidth}"
    ></div>
    <div v-if="isDesktop"
      class="nav"
      :class="{pressingHandle}"
      :style="[getNavTopPosition, {width: navWidth}]"
    >
      <Appbar class="Appbar"
        :value="viewName"
        :pressingHandle='pressingHandle'
        :view-type="viewType"
        :appbarHided='appbarHided'
        :width='navWidth'
        @appbar="toggleAppbar"
        @section="v => section = v"

        @handle-pointerdown='pointerdown'
      />
    </div>
    <div class="cont" :class="[platform, {pressingHandle}]">
      <ViewControler
        :isSmart="isSmart"
        :viewType='viewType'
        :viewName='viewName'
      />
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
      width: 450,

      pressingHandle: false,
      handleStart: 0,
    }
  },
  created() {
    this.getScrollTop()
    window.addEventListener('scroll', this.getScrollTop)

    const savedWidth = localStorage.getItem('watchr_menu_width')
    if (savedWidth !== null)
      this.width = parseInt(savedWidth, 10)
  },
  methods: {
    handlePointermove(evt) {
      if (this.pressingHandle) {
        this.width += evt.screenX - this.handleStart
        localStorage.setItem('watchr_menu_width', this.width)
        this.handleStart = evt.screenX
      }
    },
    pointerdown(evt) {
      this.pressingHandle = true
      this.handleStart = evt.screenX
    },
    pointerup() {
      this.pressingHandle = false
    },
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
        case 'Statistics': return true
        case 'Upcoming': return true
        case 'Anytime': return true
        case 'Someday': return true
        case 'Tomorrow': return true
        case 'Completed': return true
        case 'Inbox': return true
      }
      return false
    },
    navWidth() {
      return this.width + 'px'
    },
  },
}

</script>

<style scoped>

.UserView {
  margin: 8px 0;
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
  flex-grow: 0;
  flex-shrink: 0;
  transition-duration: .6s;
  transition-delay: 0s;
}

.nav {
  position: fixed;
  left: 0;
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
  flex-basis: 0 !important;
  max-width: 0 !important;
  transition-delay: .6s;
  transition-duration: .6s;
}

.appbarHided .cont {
  flex-basis: 925px !important;
  flex-grow: 0;
  margin-left: 0;
}

.pressingHandle {
  transition: none !important;
  transition-duration: 0s !important;
}

</style>
