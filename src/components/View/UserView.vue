
<template>
  <div class="UserView" :class="[{sidebarHided}, layout]"
    @pointerup='pointerup'
    @pointermove='handlePointermove'
  >
    <div v-if="isDesktopBreakPoint"
      class="nav-shadow"
      :class="{pressingHandle}"
      :style="{width: navWidth, maxWidth: navWidth, flexBasis: navWidth}"
    ></div>
    <div v-if="isDesktopBreakPoint"
      class="nav"
      :class="{pressingHandle}"
      :style="[navObj, {width: getNavWidth}]"
    >
      <Sidebar
        :value="viewName"
        :pressingHandle='pressingHandle'
        :view-type="viewType"
        :sidebarHided='sidebarHided'
        :width='getNavWidth'
        @sidebar="toggleSidebar"
        @section="v => section = v"

        @handle-pointerdown='pointerdown'
      />
    </div>
    <div class="cont" :class="[layout, {pressingHandle}]">
      <ViewControler
        :width='!sidebarHided ? width : 0'
        :sidebarHided='sidebarHided'
      
        :isSmart="isSmartList"
        :viewType='viewType'
        :viewName='viewName'
        @sidebar='toggleSidebar'
      />
    </div>
  </div>
</template>

<script>

import SidebarVue from '../Sidebar/Sidebar.vue'
import ViewControlerVue from '../View/Controller/ViewControler.vue'

import { mapGetters, mapState } from 'vuex'

export default {
  props: ['hideNavbar'],
  components: {
    Sidebar: SidebarVue,
    ViewControler: ViewControlerVue
  },
  data() {
    return {
      sidebarHided: false,
      scrollTop: null,
      width: 250,

      pressingHandle: false,
      handleStart: 0,

      interval: null,
      navObj: {},
    }
  },
  created() {
    this.sidebarHided = localStorage.getItem('watchr_slim_mode') === 'true'
    
    this.getScrollTop()
    window.addEventListener('scroll', this.getScrollTop)

    if (this.isDesktopBreakPoint)
      this.interval = setInterval(() => {
        this.getNavTopPosition()
      }, 500)

    const savedWidth = localStorage.getItem('watchr_menu_width')
    if (savedWidth !== null)
      this.width = parseInt(savedWidth, 10)
  },
  beforeDestroy() {
    clearInterval(this.interval)
  },
  methods: {
    handlePointermove(evt) {
      if (this.pressingHandle) {
        const newWidth = this.width + (evt.screenX - this.handleStart)
        if (newWidth > 225 && newWidth < 800) {
          this.width = newWidth
          localStorage.setItem('watchr_menu_width', this.width)
          this.handleStart = evt.screenX
        } else this.pressingHandle = false
      }
    },
    pointerdown(evt) {
      this.pressingHandle = true
      this.handleStart = evt.screenX
    },
    pointerup() {
      this.pressingHandle = false
    },
    getScrollTop(evt) {
      this.scrollTop = window.scrollY
    },
    toggleSidebar() {
      this.sidebarHided = !this.sidebarHided
      localStorage.setItem('watchr_slim_mode', this.sidebarHided)
    },
    getNavTopPosition() {
      setTimeout(() => {
        const app = document.getElementById('app')
        if (app) {
          let height = app.offsetHeight

          const minimalBottomPosition = this.hideNavbar ? 45 : 60
        
          this.navObj = {
            height: (height - minimalBottomPosition) + 'px',
          }
        }
      })
    },
  },
  computed: {
    ...mapState(['viewName', 'viewType']),
    ...mapGetters(['layout', 'isSmartList', 'isDesktopBreakPoint']),
    getNavWidth() {
      return !this.sidebarHided ? this.navWidth : '0px'
    },
    navWidth() {
      return this.width + 'px'
    },
  },
  watch: {
    scrollTop() {
      this.getNavTopPosition()
    },
    hideNavbar() {
      this.getNavTopPosition()
    },
  }
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
  transition-duration: .175s !important;
  left: 0;
  z-index: 5;
}

.cont {
  position: relative;
  display: flex;
  justify-content: center;
  flex-basis: 100%;
  flex-grow: 1;
  transition-delay: .4s;
  transition-duration: .6s;
  z-index: 4;
}

.sidebarHided .nav-shadow {
  flex-basis: 0 !important;
  max-width: 0 !important;
  transition-delay: .6s;
  transition-duration: .6s;
}

.sidebarHided .cont {
  flex-basis: 1075px !important;
  margin: 0 20px;
  flex-grow: 0;
  margin-left: 0;
}

.pressingHandle {
  transition: none !important;
  transition-duration: 0s !important;
}

</style>
