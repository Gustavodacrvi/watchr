<template>
  <div id="app" :class="[{hidePassive}, platform]">
    <transition name="fade-t">
      <Popup v-if="$store.getters.isPopupOpened" @close="closePopup"/>
    </transition>
    <transition name="fade-t">
      <FileReader v-if="fileURL"/>
    </transition>
    <Toast/>
    <Menu class="menu" :class='{slideMenu: isMenuOpened && !isDesktop}'/>
    <transition name="fade-t">
      <MobileIcondrop v-if="isIconDropOpened"/>
    </transition>

    <div class="content">
      <transition name="nav-trans">
        <NavBar v-if='(!hideNavbar || !allowNavHide)'
          :route='route'
        />
      </transition>
      <transition name="fade-t" appear mode="out-in">
          <router-view class="router-view" :class="{'non-hided': !hideNavbar && isDesktop}" :hideNavbar='hideNavbar'
        />
      </transition>
    </div>
  </div>
</template>

<script>

import utils from './utils/'

const c = utils.asyncComp

import { mapGetters, mapState } from 'vuex'

export default {
  components: {
    FileReader: c(import(/* webpackChunkName: "FileReader" */ './components/View/FileReader/FileReader.vue')),
    NavBar: c(import(/* webpackChunkName: "NavBar" */ './components/NavBar/NavBar.vue'), false),
    Popup: c(import(/* webpackChunkName: "Popup" */ './components/Popup/Popup.vue')),
    Toast: c(import(/* webpackChunkName: "Toast" */ './components/Toast.vue')),
    Menu: c(import(/* webpackChunkName: "Menu" */ './components/NavBar/Menu.vue')),
    MobileIcondrop: c(import(/* webpackChunkName: "MobileIconDrop" */ './components/Popup/MobileIcondrop.vue')),
  },
  data() {
    return {
      hided: true,
      hideTimeout: null,
      timeBeforeMouseMove: 0,
      scrollTimeout: null,

      initialSmartViewRender: false,

      lastRouteCameFromMenu: false,
      saveHistory: true,
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
    const unToggle = () => {
      setTimeout(() => {
        this.$store.commit('toggleControl', false)
        this.$store.commit('toggleShift', false)
        this.$store.commit('toggleAlt', false)
      })
    }

    window.addEventListener('focus', () => unToggle())
    window.addEventListener('visibilitychange', () => unToggle())

    this.updateViewType(true)
  },
  mounted() {
    this.$el.addEventListener('dragenter', evt => evt.preventDefault())
    this.$el.addEventListener('dragover', evt => evt.preventDefault())
    this.$el.addEventListener('drop', () => this.$store.commit('cameFromAnotherTabDragStart', null)
)
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
      if (key === "Shift")
        this.$store.commit('toggleShift', false)
      if (key === "Alt")
        this.$store.commit('toggleAlt', false)
    },
    keydown({key}) {
      const active = document.activeElement
      const isTyping = active && (active.nodeName === 'INPUT' || active.nodeName === 'TEXTAREA')

      if (!isTyping && !this.isOnShift)
        switch (key) {
          case 'ArrowLeft': {
            if (this.historyPos > 1) {
              this.saveHistory = false
              this.$store.commit('decreaseHistory')
              this.$router.go(-1)
            }
            break
          }
          case 'ArrowRight': {
            this.saveHistory = false
            const old = this.$route.fullPath
            this.$router.go(1)
            setTimeout(() => {
              if (old !== this.$route.fullPath)
                this.$store.commit('increaseHistory')
            })
            break
          }
        }
      
      if (key === 'Control')
        this.$store.commit('toggleControl', true)
      if (key === "Shift")
        this.$store.commit('toggleShift', true)
      if (key === "Alt")
        this.$store.commit('toggleAlt', true)
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
      if (y && y < (!this.hideNavbar ? 65 : 10)) {
        clear()
        this.hideTimeout = setTimeout(() => {
          this.hided = false
        }, 200)
      } else if (y) {
        clear()
        this.hideTimeout = setTimeout(() => {
          this.hided = true
        }, 250)
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
      let firstNav = false

      if (
        (path === '/user' && atLeastOneUndefined)
      ) {
        firstNav = true
        const view = this.getInitialSmartView
        this.$router.replace(`/user?${view.viewType}=${view.viewName}`)
      }
      if (saveRoute) {
        if (viewName && viewType)
          document.getElementById('meta-title')
            .innerHTML = `${viewName} - ${viewType.replace(/^[a-z]/, m => m.toUpperCase())}`
        this.$store.commit('navigate', {
          viewName, viewType, newRoute: !this.saveHistory || firstNav || !viewName,
        })
        this.saveHistory = true
      }
    },
    getCalendarEvents() {
      if (typeof gapi !== "undefined" && gapi.client && gapi.client.calendar) {
        gapi.client.calendar.calendarList.list().then(res => {
          this.$store.commit('saveCalendarList', res.result.items)
        })
      }
    },
  },
  computed: {
    ...mapState(['fileURL', 'user', 'allowNavHide', 'pressingKey', 'historyPos', 'isOnShift']),
    ...mapGetters(['isDesktop', 'getInitialSmartView', 'needsUpdate', 'platform']),
    isReady() {
      return this.$store.state.googleCalendarReady
    },
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
      const isAnonymous = this.user && this.user.isAnonymous
      if (!this.user || isAnonymous) return false
      if (!this.route || (!this.isDesktop && this.appRoute)) return true
      const isNotOnUser = this.$route.path !== '/user'
      if (!this.user || this.needsUpdate || !this.isDesktop || isAnonymous || isNotOnUser) return false
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
      return this.timeBeforeMouseMove > 4 && this.isDesktop
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
    },
    isReady() {
      this.getCalendarEvents()
    },
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
  transition-duration: .3s;
}

.desktop .router-view {
  top: 46px;
}

.non-hided {
  top: 0;
}

.menu {
  transform: translateX(-100%);
  transition: transform .15s;
  transition-timing-function: ease-in;
}

.slideMenu {
  transform: translateX(0px);
  transition-timing-function: ease-out;
}

.nav-trans-enter, .nav-trans-leave-to {
  opacity: 0 !important;
  height: 0 !important;
  transition: opacity .3s ease-out, height .3s ease-out;
}

.nav-trans-leave, .nav-trans-enter-to {
  opacity: 1 !important;
  height: 65px !important;
  transition: opacity .3s ease-in, height .3s ease-in;
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
