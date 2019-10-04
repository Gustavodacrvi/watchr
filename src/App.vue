<template>
  <div v-if="l" id="app" :class="{hidePassive}">
    <transition name="popup">
      <Popup v-if="$store.getters.isPopupOpened" @close="closePopup"/>
    </transition>
    <Toast/>
    <transition name="popup">
      <Menu v-if="isMenuOpened && !isDesktop"/>
    </transition>
    <transition>
      <MobileIcondrop v-if="isIconDropOpened && !isDesktop"/>
    </transition>

    <div class="content">
      <transition name="nav-trans" mode="out-in">
        <NavBar v-if='!hideNavbar'/>
        <div v-if="hideNavbar" style="height: 65px;"></div>
      </transition>
      <div v-if="!isDesktop" style="height: 65px"></div>
      <transition name="view-t" appear mode="out-in">
        <router-view class="router-view" :class="{hided: hideNavbar}"/>
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

import { mapGetters, mapState } from 'vuex'

export default {
  components: {
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
    }
  },
  created() {
    setInterval(() => {
      this.timeBeforeMouseMove++
    }, 1000)
    window.addEventListener('keydown', this.keydown)
    window.addEventListener('keyup', this.keyup)
    window.addEventListener('mousemove', this.getMousePos)
  },
  methods: {
    keyup({key}) {
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
    closePopup() {
      this.$store.commit('closePopup')
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
        }, 500)
      } else if (y) {
        clear()
        this.hideTimeout = setTimeout(() => {
          this.hided = true
        }, 300)
      }
    },
  },
  computed: {
    ...mapGetters(['isDesktop', 'isStandAlone', 'l']),
    isMenuOpened() {
      return this.$route.fullPath === '/menu'
    },
    hideNavbar() {
      if (!this.isStandAlone || !this.isDesktop) return false
      return this.hided
    },
    hidePassive() {
      return this.timeBeforeMouseMove > 5 && this.isStandAlone && this.isDesktop
    },
    isIconDropOpened() {
      return this.$store.state.iconDrop !== null
    },
  },
  watch: {
    $route(to, from) {
      if (to && to.path !== '/popup')
        this.closePopup()
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

.hided {
  top: -13px;
}

.popup-enter, .popup-leave-to {
  opacity: 0;
  transition: opacity .2s;
}

.popup-leave, .popup-enter-to {
  opacity: 1;
  transition: opacity .2s;
}

.nav-trans-enter, .nav-trans-leave-to {
  opacity: 0;
  transform: translateY(-20px);
  transition: opacity .3s ease-out, transform .3s ease-out;
}

.nav-trans-leave, .nav-trans-enter-to {
  opacity: 1;
  transform: translateY(0px);
  transition: opacity .3s ease-in, transform .3s ease-in;
}

.router-view {
  position: relative;
  top: 0;
  transition: top .3s;
}

.view-t-enter, .view-t-leave-to {
  opacity: 0;
  transition: opacity .2s;
}

.view-t-leave, .view-t-enter-to {
  opacity: 1;
  transition: opacity .2s;
}

</style>

<style>

.passive {
  transition: opacity .6s !important;
  opacity: 1 !important;
}

.hidePassive .passive {
  opacity: 0 !important;
  transition: opacity .6s !important;
}

</style>
