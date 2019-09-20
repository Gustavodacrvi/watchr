<template>
  <div id="app">
    <transition name="popup">
      <Popup v-if="$store.getters.isPopupOpened" @close="closePopup"/>
    </transition>
    <Toast/>

    <NavBar/>
    <router-view/>

    {{ $store.state.authState }}
  </div>
</template>

<script>

import NavBarVue from './components/NavBar/NavBar.vue'
import PopupVue from './components/Popup/Popup.vue'
import ToastVue from './components/Toast.vue'

export default {
  components: {
    NavBar: NavBarVue,
    Popup: PopupVue,
    Toast: ToastVue,
  },
  methods: {
    closePopup() {
      this.$store.commit('closePopup')
    }
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
