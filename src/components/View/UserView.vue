
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
        :MINIMUM_WIDTH='MINIMUM_WIDTH'
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
      />
    </div>
  </div>
</template>

<script>

import SidebarVue from '../Sidebar/Sidebar.vue'
import ViewControlerVue from '../View/Controller/ViewControler.vue'

import { mapGetters, mapState } from 'vuex'

const DEFAULT_WIDTH = 250

export default {
  props: ['hideNavbar'],
  components: {
    Sidebar: SidebarVue,
    ViewControler: ViewControlerVue
  },
  data() {
    return {
      MINIMUM_WIDTH: 135,
      sidebarHided: false,
      scrollTop: null,
      width: DEFAULT_WIDTH,

      pressingHandle: false,
      handleStart: 0,
      wasHidedBeforePointerDown: false,

      interval: null,
      navObj: {},
      pointerTimeout: null,
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
      if (this.pointerTimeout)
        return;
      
      if (this.pressingHandle) {
        this.pointerTimeout = setTimeout(() => {
          this.pointerTimeout = null

          const newWidth = this.width + (evt.screenX - this.handleStart)
          if (newWidth < 800) {
            this.sidebarHided = false
            this.width = newWidth
            localStorage.setItem('watchr_menu_width', this.width)
            this.handleStart = evt.screenX
          } else this.pressingHandle = false

        }, 10)
      }
    },
    pointerdown(evt) {
      this.wasHidedBeforePointerDown = this.sidebarHided
      this.pressingHandle = true
      this.handleStart = evt.screenX
    },
    pointerup() {
      this.pressingHandle = false

      this.$nextTick(() => {
        const sensitiveArea = (this.width < this.MINIMUM_WIDTH)

        if (sensitiveArea && !this.wasHidedBeforePointerDown) {
          this.sidebarHided = true
          this.width = 0
          localStorage.setItem('watchr_menu_width', this.width)
          localStorage.setItem('watchr_slim_mode', true)
        } else if (this.wasHidedBeforePointerDown && !sensitiveArea) {
          this.sidebarHided = false
          this.width = this.width
          localStorage.setItem('watchr_menu_width', this.width)
          localStorage.setItem('watchr_slim_mode', false)
        } else if (sensitiveArea) {
          this.sidebarHided = true
          this.width = 0
        }
      })
    },
    getScrollTop(evt) {
      this.scrollTop = window.scrollY
    },
    getNavTopPosition() {
      setTimeout(() => {
        const app = document.getElementById('app')
        if (app) {
          let height = app.offsetHeight

          const minimalBottomPosition = this.hideNavbar ? 33 : 58
        
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
  transition-duration: .4s;
  transition-delay: 0s;
}

.nav {
  position: fixed;
  transition-duration: .15s !important;
  left: 0;
  z-index: 5;
}

.pressingHandle {
  transition-duration: none !important;
}

.cont {
  position: relative;
  display: flex;
  justify-content: center;
  flex-basis: 100%;
  flex-grow: 1;
  transition-delay: .4s;
  transition-duration: .4s;
  z-index: 4;
}

.sidebarHided .nav-shadow {
  flex-basis: 0 !important;
  max-width: 0 !important;
  transition-delay: .4s;
  transition-duration: .4s;
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
