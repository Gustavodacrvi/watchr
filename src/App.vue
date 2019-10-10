<template>
  <div v-if="l" id="app" :class="{hidePassive}">
    <transition name="fade">
      <Popup v-if="$store.getters.isPopupOpened" @close="closePopup"/>
    </transition>
    <Toast/>
    <transition name="fade">
      <Menu v-show="isMenuOpened && !isDesktop"/>
    </transition>
    <FastSearch v-if="fastSearch"/>
    <MobileIcondrop v-if="isIconDropOpened && !isDesktop"/>

    <div class="content">
      <transition name="nav-trans" mode="out-in">
        <NavBar v-if='!hideNavbar' @open-menu="openedMenu = true"/>
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
import FastSearchVue from './components/Popup/FastSearch.vue'

import { mapGetters, mapState } from 'vuex'

export default {
  components: {
    NavBar: NavBarVue,
    Popup: PopupVue,
    Toast: ToastVue,
    Menu: MenuVue,
    MobileIcondrop: MobileIcondropVue,
    FastSearch: FastSearchVue,
  },
  data() {
    return {
      hided: true,
      hideTimeout: null,
      timeBeforeMouseMove: 0,
      openedMenu: false,
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
    ...mapState(['fastSearch']),
    ...mapGetters(['isDesktop', 'isStandAlone', 'l']),
    hideNavbar() {
      if (!this.isStandAlone || !this.isDesktop) return false
      return this.hided
    },
    isMenuOpened() {
      return this.$route.fullPath === '/menu'
    },
    hidePassive() {
      return this.timeBeforeMouseMove > 4 && this.isStandAlone && this.isDesktop
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


.fade-enter, .fade-leave-to {
  opacity: 0;
  transition: opacity .2s;
}

.fade-leave, .fade-enter-to {
  opacity: 1;
  transition: opacity .2s;
}

.nav-trans-enter, .nav-trans-leave-to {
  opacity: 0;
  transform: translateY(-25px);
  transition: opacity .2s ease-out, transform .2s ease-out;
}

.nav-trans-leave, .nav-trans-enter-to {
  opacity: 1;
  transform: translateY(0px);
  transition: opacity .2s ease-in, transform .2s ease-in;
}

.router-view {
  position: relative;
  top: 0;
  transition: top .2s;
}

.hided {
  top: -22px !important;
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
  transition: opacity .6s;
  opacity: 1 !important;
}

.hidePassive .passive {
  opacity: 0 !important;
  transition: opacity .6s;
}

</style>
