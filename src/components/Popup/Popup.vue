<template>
  <div class="Popup" :class="platform" @click="$emit('close')">
    <Icon class="icon cursor" icon="arrow" :primary-hover="true" @click="closeMobilePopup"/>
    <component class="component" :is="popup.comp"/>
  </div>
</template>

<script>

import SignupVue from './Auth/Signup.vue'
import SigninVue from './Auth/Signin.vue'
import IconVue from '../Icon.vue'

import { mapGetters, mapState } from 'vuex'

export default {
  components: {
    Signup: SignupVue,
    Signin: SigninVue,
    Icon: IconVue,
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

.icon {
  position: absolute;
  left: 15px;
  top: 10px;
  transform: rotate(90deg);
}

</style>
