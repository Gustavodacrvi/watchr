<template>
  <div id="app" :class="[{hidePassive}, deviceLayout, $store.state.theme]">
    <transition name="fade-t">
      <Popup v-if="$store.getters.isPopupOpened" @close="closePopup"/>
    </transition>
    <transition name="fade-t">
      <FileReader v-if="fileURL"/>
    </transition>
    <Toast/>
    <Menu class="menu" :class='{slideMenu: isMenuOpened && !isDesktopBreakPoint}'/>
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
          <router-view
            class="router-view"
            :class="{'non-hided': !hideNavbar && isDesktopBreakPoint, relative: route !== 'home'}" :hideNavbar='hideNavbar'
        />
      </transition>
    </div>
  </div>
</template>

<script>

import utils from './utils/'

const c = utils.asyncComp

import mom from 'moment'

import { mapGetters, mapState } from 'vuex'
import timeline from './utils/timeline'

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

      lastRouteCameFromMenu: false,
      saveHistory: true,
    }
  },
  created() {
    setInterval(() => {
      this.timeBeforeMouseMove++
    }, 1000)

    if (this.isDesktopDevice) {
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
    setInterval(this.getGmailInbox, 300000)
  },
  methods: {
    toggleScroll(evt) {
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
    goBack() {
      if (this.historyPos > 1) {
        this.saveHistory = false
        this.$store.commit('decreaseHistory')
        this.$router.go(-1)
      }
    },
    goNext() {
      this.saveHistory = false
      const old = this.$route.fullPath
      this.$router.go(1)
      setTimeout(() => {
        if (old !== this.$route.fullPath)
          this.$store.commit('increaseHistory')
      })
    },
    keydown({key}) {
      const active = document.activeElement
      const isTyping = active && (active.nodeName === 'INPUT' || active.nodeName === 'TEXTAREA')

      if (!isTyping && !this.isOnShift && !this.isEditing)
        switch (key) {
          case 'ArrowLeft': {
            this.goBack()
            break
          }
          case 'ArrowRight': {
            this.goNext()
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

      const saveTitle = str => {
          document.getElementById('meta-title')
            .innerHTML = str  
        }

      if (
        (path === '/user' && atLeastOneUndefined)
      ) {
        firstNav = true
        const view = this.getInitialSmartView
        this.$router.replace(`/user?${view.viewType}=${view.viewName}`)
      }
      else if (saveRoute && viewName && viewType) {

        if (viewType !== 'calendar')
          saveTitle(`${viewName} - ${viewType.replace(/^[a-z]/, m => m.toUpperCase())}`)
        else {
          saveTitle(utils.getHumanReadableDate(viewName))
        }
        
        this.$store.commit('navigate', {
          viewName, viewType, newRoute: !this.saveHistory || firstNav || !viewName,
        })
        this.saveHistory = true
      } else saveTitle('watchr')
    },
    
    async getCalendarList() {
      if (this.allowCalendar && typeof gapi !== "undefined" && gapi.client && gapi.client.calendar) {
        let res = await gapi.client.calendar.calendarList.list()
        this.$store.commit('saveCalendarList', res.result.items)
        
        res = await gapi.client.calendar.colors.get()
        this.$store.commit('saveCalendarColorIds', res.result.event)
      }
      return;
    },
    async getCalendarEvents() {
      this.$store.commit('saveViewEvents', await timeline.getEvents(this, this.calendarDate))
    },
    
    getGmailInbox() {
      setTimeout(async () => {
        if (this.userInfo.getGmailInbox && typeof gapi !== 'undefined' && gapi.client && gapi.client.gmail) {
          const res = await gapi.client.gmail.users.threads.list({
            userId: 'me',
            maxResults: 30,
            format: 'full',
            labelIds: [
              'INBOX',
              'UNREAD',
            ]
          })
          
          if (!res.result.threads)
            return;
  
          let threads = await Promise.all(res.result.threads.map(({id}) => gapi.client.gmail.users.threads.get({
            id, userId: 'me',
          })))
          threads = threads.filter(el => !this.$store.getters['task/allTasks'].some(t => t.id === el.result.id))
  
          if (threads.length) {
            this.$store.dispatch('task/addTasksFromGmailThreads', threads)
  
            if (this.userInfo.markEmailsAsRead)
              await Promise.all(threads.map(t => gapi.client.gmail.users.threads.modify({
                id: t.result.id,
                userId: 'me',
                removeLabelIds: ["UNREAD"],
              })))
    
            this.$store.commit('pushToast', {
              name: `Added ${threads.length} inbox tasks from Gmail's inbox${this.userInfo.markEmailsAsRead ? ' and marked them as read.' : '.'}`,
              type: 'success',
              seconds: 5,
            })
          }
        }
      }, 2500)
    },
  },
  computed: {
    ...mapState(['fileURL', 'user', 'allowNavHide', 'pressingKey', 'isEditing', 'historyPos', 'isOnShift', 'userInfo', 'scheduling', 'allowCalendar']),
    ...mapGetters(['isDesktopBreakPoint', 'isDesktopDevice', 'getInitialSmartView', 'calendarDate', 'needsUpdate', 'layout', 'deviceLayout']),
    isReady() {
      return this.$store.state.googleCalendarReady
    },
    isGmailReady() {
      return this.$store.state.gmailReady
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
      if (!this.route || (!this.isDesktopBreakPoint && this.appRoute)) return true
      const isNotOnUser = this.$route.path !== '/user'
      if (!this.user || this.needsUpdate || !this.isDesktopBreakPoint || isAnonymous || isNotOnUser) return false
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
      return this.timeBeforeMouseMove > 4 && this.isDesktopBreakPoint
    },
    isIconDropOpened() {
      return this.$store.state.iconDrop !== null
    },
  },
  watch: {
    $route(to, from) {
      const isGoingToPopup = to.path === '/popup'
      const isGoingToMenu = to.path === '/menu'
      const notGoingToAnyOfTheTwo = (!isGoingToPopup && !isGoingToMenu)

      if (to && !isGoingToPopup && this.$store.getters.isPopupOpened)
        this.closePopup(true)
      this.updateViewType(this.isDesktopBreakPoint || notGoingToAnyOfTheTwo)

      this.lastRouteCameFromMenu = from.path === '/menu'
    },
    async allowCalendar() {
      await this.getCalendarList()
      await this.getCalendarEvents()
    },
    async isReady() {
      await this.getCalendarList()
      await this.getCalendarEvents()
    },
    async getCalendarEvents() {
      this.getCalendarEvents()
    },
    isGmailReady() {
      this.getGmailInbox()
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
  transition-duration: .3s;
}

.relative {
  position: relative;
}

.desktop .router-view {
  top: 25px;
}

.non-hided {
  top: -3px !important;
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
  height: 45px !important;
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

#app.desktop {
  font-size: var(--font-size);
}

</style>
