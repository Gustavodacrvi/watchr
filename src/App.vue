<template>
  <div v-if="l" id="app" :class="{hidePassive}">
    <transition name="fade-t">
      <Popup v-if="$store.getters.isPopupOpened" @close="closePopup"/>
    </transition>
    <transition name="fade-t">
      <FileReader v-if="fileURL"/>
    </transition>
    <Toast/>
    <Menu class="menu" :class='{slideMenu: isMenuOpened && !isDesktop}'/>
    <transition name="fade-t">
      <MobileIcondrop v-if="isIconDropOpened && !isDesktop"/>
    </transition>

    <div class="content">
      <transition name="nav-trans" mode="out-in">
        <NavBar v-if='(!hideNavbar || !allowNavHide)'
          :route='route'
        />
      </transition>
      <div v-if="isDesktop && hideNavbar" style="height: 65px;"></div>
      <transition name="fade-t" appear mode="out-in">
          <router-view class="router-view" :class="{hided: hideNavbar && isDesktop}" :hideNavbar='hideNavbar'
        />
      </transition>
    </div>
  </div>
</template>

<script>

import NavBarVue from './components/NavBar/NavBar.vue'
import PopupVue from './components/Popup/Popup.vue'
import ToastVue from './components/Toast.vue'
import MenuVue from './components/NavBar/Menu.vue'
import MobileIcondropVue from './components/Popup/MobileIcondrop.vue'
import FileReader from './components/View/FileReader/FileReader.vue'

import { mapGetters, mapState } from 'vuex'

export default {
  components: {
    FileReader,
    NavBar: NavBarVue,
    Popup: PopupVue,
    Toast: ToastVue,
    Menu: MenuVue,
    MobileIcondrop: MobileIcondropVue,
  },
  data() {
    return {
      hided: true,
      hideTimeout: null,
      timeBeforeMouseMove: 0,
      scrollTimeout: null,

      initialSmartViewRender: false,

      lastRouteCameFromMenu: false,
    }
  },
  created() {
    setInterval(() => {
      this.timeBeforeMouseMove++
    }, 1000)
    if (this.isDesktop) {
      window.addEventListener('keydown', this.keydown)
      window.addEventListener('keyup', this.keyup)
      window.addEventListener('mousemove', this.getMousePos)
    }
    document.addEventListener('scroll', this.toggleScroll)

    this.updateViewType(true)
  },
  methods: {
    toggleScroll() {
      const tog = b => this.$store.commit('toggleScroll', b)

      tog(true)
      if (this.scrollTimeout)
        clearTimeout(this.scrollTimeout)
      this.scrollTimeout = setTimeout(() => {
        tog(false)
      }, 80)
    },
    keyup({key}) {
      this.$store.commit('unpressKey')
      if (key === 'Control')
        this.$store.commit('toggleControl', false)
    },
    keydown({key}) {
      const active = document.activeElement
      const isTyping = active && (active.nodeName === 'INPUT' || active.nodeName === 'TEXTAREA')
      if (!isTyping && key === 'Control')
        this.$store.commit('toggleControl', true)
      if (!isTyping) this.$store.dispatch('pushKeyShortcut', key)
    },
    closePopup(persistOnTheSameView) {
      this.$store.dispatch('closePopup', persistOnTheSameView)
    },
    getMousePos(evt) {
      const clear = () => {
        if (this.hideTimeout) clearTimeout(this.hideTimeout)
      }
      this.timeBeforeMouseMove = 0
      
      const y = evt.pageY
      if (y && y < 60) {
        clear()
        this.hideTimeout = setTimeout(() => {
          this.hided = false
        }, 250)
      } else if (y) {
        clear()
        this.hideTimeout = setTimeout(() => {
          this.hided = true
        }, 300)
      }
    },
    updateViewType(saveRoute) {
      const query = this.$route.query
      const keys = Object.keys(query)
      let viewType = keys[0]
      let viewName = query[viewType]
      const name = this.$route.name
      const path = this.$route.path
      const atLeastOneUndefined = (viewName === undefined || viewType === undefined)

      if (
        (this.isStandAlone && !this.initialSmartViewRender) || 
        (path === '/user' && atLeastOneUndefined)
      ) {
        const view = this.getInitialSmartView
        this.$router.replace(`/user?${view.viewType}=${view.viewName}`)
        this.initialSmartViewRender = true
      }
      if (saveRoute) {
        if (viewName && viewType)
          document.getElementById('meta-title')
            .innerHTML = `${viewName} - ${viewType.replace(/^[a-z]/, m => m.toUpperCase())}`
        
        this.$store.commit('navigate', {
          viewName, viewType,
        })
      }
    }
  },
  computed: {
    ...mapState(['fileURL', 'user', 'allowNavHide', 'pressingKey']),
    ...mapGetters(['isDesktop', 'isStandAlone', 'l', 'getInitialSmartView', 'needsUpdate']),
    route() {
      if (this.$route.matched[0]) {
        return this.$route.matched[0].name
      }
      return this.$route.name
    },
    appRoute() {
      return this.route === 'user' ||
          this.route === 'popup' ||
          this.route === 'menu'
    },
    hideNavbar() {
      if (!this.route || (!this.isDesktop && this.appRoute)) return true
      const isAnonymous = this.user && this.user.isAnonymous
      const isNotOnUser = this.$route.path !== '/user'
      if (!this.user || this.needsUpdate || !this.isStandAlone || !this.isDesktop || isAnonymous || isNotOnUser) return false
      return this.hided
    },
    isMenuOpened() {
      const isInMenu = this.$route.name === 'menu'
      const isInPopup = this.$route.path === '/popup'
      
      return isInMenu || (isInPopup && this.lastRouteCameFromMenu)
    },
    path() {
      return this.$route.fullPath
    },
    hidePassive() {
      return this.timeBeforeMouseMove > 4 && this.isStandAlone && this.isDesktop
    },
    isIconDropOpened() {
      return this.$store.state.iconDrop !== null
    },
  },
  watch: {
    userInfo() {
      this.$store.dispatch('pomo/updateDurations')
    },
    user() {
      this.$store.dispatch('pomo/updateDurations')
    },
    $route(to, from) {
      const isGoingToPopup = to.path === '/popup'
      const isGoingToMenu = to.path === '/menu'
      const notGoingToAnyOfTheTwo = (!isGoingToPopup && !isGoingToMenu)
      
      if (to && !isGoingToPopup && this.$store.getters.isPopupOpened)
        this.closePopup(true)
      this.updateViewType(this.isDesktop || notGoingToAnyOfTheTwo)

      this.lastRouteCameFromMenu = from.path === '/menu'
    }
  }
}

</script>

<style src="@/assets/css/index.css">
</style>

<style scoped>

#app {
  position: absolute;
  height: 100%;
  width: 100%;
}

.content {
  display: flex;
  min-height: 100%;
  flex-direction: column;
}

.router-view {
  position: relative;
  top: 0;
  transition: top .15s;
}

.hided {
  top: -22px !important;
}

.menu {
  transform: translateX(-100%);
  transition: transform .2s;
  transition-timing-function: ease-in;
}

.slideMenu {
  transform: translateX(0px);
  transition-timing-function: ease-out;
}

.nav-trans-enter, .nav-trans-leave-to {
  opacity: 0;
  transform: translateY(-25px);
  transition: opacity .15s ease-out, transform .15s ease-out;
}

.nav-trans-leave, .nav-trans-enter-to {
  opacity: 1;
  transform: translateY(0px);
  transition: opacity .15s ease-in, transform .15s ease-in;
}

</style>

<style>

.fade-t-enter, .fade-t-leave-to {
  opacity: 0;
  transition: opacity .15s;
}

.fade-t-leave, .fade-t-enter-to {
  opacity: 1;
  transition: opacity .15s;
}

.passive {
  transition: opacity .6s;
  opacity: 1 !important;
}

.hidePassive .passive {
  opacity: 0 !important;
  transition: opacity .6s;
}

</style>
