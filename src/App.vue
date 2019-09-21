<template>
  <div id="app">
    <transition name="popup">
      <Popup v-if="$store.getters.isPopupOpened" @close="closePopup"/>
    </transition>
    <Toast/>
    <transition name="popup">
      <Menu v-if="isMenuOpened && !isDesktop"/>
    </transition>

    <NavBar/>
    <router-view/>
  </div>
</template>

<script>

import NavBarVue from './components/NavBar/NavBar.vue'
import PopupVue from './components/Popup/Popup.vue'
import ToastVue from './components/Toast.vue'
import MenuVue from './components/NavBar/Menu.vue'

import { mapGetters } from 'vuex'

export default {
  components: {
    NavBar: NavBarVue,
    Popup: PopupVue,
    Toast: ToastVue,
    Menu: MenuVue,
  },
  created() {
    window.addEventListener('keydown', this.keydown)
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this,keydown)
  },
  methods: {
    keydown({key}) {
      const active = document.activeElement
      const isTyping = active && (active.nodeName === 'INPUT' || active.nodeName === 'TEXTAREA') && this.isOnAppRoute
      if (!isTyping) this.$store.dispatch('pushKeyShortcut', key)
    },
    closePopup() {
      this.$store.commit('closePopup')
    }
  },
  computed: {
    isMenuOpened() {
      return this.$route.fullPath === '/menu'
    },
    ...mapGetters(['isDesktop']),
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

.popup-enter, .popup-leave-to {
  opacity: 0;
  transition: opacity .2s;
}

.popup-leave, .popup-enter-to {
  opacity: 1;
  transition: opacity .2s;
}

</style>
