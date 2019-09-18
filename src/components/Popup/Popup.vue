<template>
  <div class="Popup" :class="platform" @click="$emit('close')">
    <component class="component" :is="popup.comp"/>
  </div>
</template>

<script>

import SignupVue from './Auth/Signup.vue'
import SigninVue from './Auth/Signin.vue'

import { mapGetters, mapState } from 'vuex'

export default {
  components: {
    Signup: SignupVue,
    Signin: SigninVue,
  },
  methods: {
    closeMobilePopup() {
      this.show = false
      setTimeout(() => {
        this.$router.go(-1)
      })
    },
    card() {
      return this.$el.getElementsByClassName('component')[0]
    }
  },
  computed: {
    ...mapState(['popup']),
    ...mapGetters(['isPopupOpened', 'platform'])
  }
}

</script>

<style scoped>

.Popup {
  position: absolute;
  top: 0;
  height: 100%;
  width: 100%;
  background-color: rgba(0,0,0,.6);
  z-index: 100;
}

.Popup.desktop {
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.Popup.mobile .component {
  width: 100%;
  height: 100%;
}

</style>
