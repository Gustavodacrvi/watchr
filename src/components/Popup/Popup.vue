<template>
  <div class="Popup" :class="platform">
    <Icon v-if="!isDesktop" class="icon cursor" icon="arrow" :primaryHover="true" @click="closeMobilePopup"/>
    <component class="component" :class="platform" :is="popup.comp"/>
    <div class="back" @click="$emit('close')"></div>
  </div>
</template>

<script>

import SignupVue from './Auth/Signup.vue'
import SigninVue from './Auth/Signin.vue'
import IconVue from '../Icon.vue'
import AddTaskVue from './Tasks/AddTask.vue'
import AddTagVue from './Tags/AddTag.vue'
import AddListVue from './Lists/AddList.vue'

import { mapGetters, mapState } from 'vuex'

export default {
  components: {
    Signup: SignupVue,
    Signin: SigninVue,
    AddTag: AddTagVue,
    Icon: IconVue,
    AddList: AddListVue,
    AddTask: AddTaskVue,
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
    ...mapGetters(['isPopupOpened', 'platform', 'isDesktop'])
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
  z-index: 100;
}

.component {
  z-index: 99;
  position: relative;
}

.back {
  position: absolute;
  height: 100%;
  width: 100%;
  z-index: 98;
}

</style>
