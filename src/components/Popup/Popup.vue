<template>
  <div class="Popup" :class="platform">
    <Icon v-if="!isDesktop && popup && popup.comp !== 'Update'" class="icon cursor" icon="arrow" :primaryHover="true" @click="closeMobilePopup"/>
    <component class="component"
      :is="popup.comp"
      :class="[platform, {isStandAlone}]"
      :payload="popup.payload"
      @close="$emit('close')"
    />
    <div class="back" @click="$emit('close')"></div>
  </div>
</template>

<script>

import Signup from './Auth/Signup.vue'
import SigninOptions from './Auth/SigninOptions.vue'
import Signin from './Auth/Signin.vue'
import Icon from '../Icon.vue'
import AddTask from './Tasks/AddTask.vue'
import AddTag from './Tags/AddTag.vue'
import AddTagNote from './Tags/AddTagNote.vue'
import AddList from './Lists/AddList.vue'
import AddListNote from './Lists/AddListNote.vue'
import Update from './Update.vue'

import { mapGetters, mapState } from 'vuex'

export default {
  components: {
    Signup, SigninOptions, Signin, AddTag,
    AddListNote, AddTagNote, Icon, AddList,
    AddTask, Update,
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
    ...mapGetters(['isPopupOpened', 'platform', 'isDesktop', 'isStandAlone'])
  }
}

</script>

<style scoped>

.Popup {
  position: fixed;
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

.component.isStandAlone.desktop {
  margin-top: 150px !important;
}

.back {
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0;
  z-index: 98;
}

</style>
