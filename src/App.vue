<template>
  <div id="app">
    <transition name="popup">
      <Popup v-if="$store.getters.isPopupOpened" @close="closePopup"/>
    </transition>
    <Toast/>

    <NavBar/>
    <router-view/>

    <Icon icon="sun"/>
  </div>
</template>

<script>

import NavBarVue from './components/NavBar/NavBar.vue'
import PopupVue from './components/Popup/Popup.vue'
import ToastVue from './components/Toast.vue'
import IconVue from './components/Icon.vue'

export default {
  components: {
    NavBar: NavBarVue,
    Popup: PopupVue,
    Toast: ToastVue,
    Icon: IconVue,
  },
  data() {
    return {
      Inbox,
    }
  },
  methods: {
    closePopup() {
      this.$store.commit('closePopup')
    }
  },
  watch: {
    $route(to, from) {
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
