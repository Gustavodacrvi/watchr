<template>
  <div id="app">
    <transition name="popup-trans">
      <Popup v-if="isPopupOpened" @close="closePopup"/>
    </transition>

    <NavBar/>
    <router-view/>
  </div>
</template>

<script>

import NavBarVue from './components/NavBar/NavBar.vue'
import PopupVue from './components/Popup/Popup.vue'

export default {
  components: {
    NavBar: NavBarVue,
    Popup: PopupVue,
  },
  methods: {
    closePopup() {
      this.$store.commit('closePopup')
    }
  },
  computed: {
    isPopupOpened() {
      return this.$store.state.popup.comp !== ''
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

</style>
