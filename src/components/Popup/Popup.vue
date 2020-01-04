<template>
  <div class="Popup scroll-thin" :class="{fillSpace}">
    <div class="popup-wrapper">
      <Icon v-if="!isDesktop && popup && popup.comp !== 'Update' && fillSpace" class="icon cursor primary-hover" icon="arrow" @click="closeMobilePopup" :circle='true'/>
      <component class="component"
        :is="popup.comp"
        :class="{isStandAlone, fillSpace}"
        :payload="popup.payload"
        @close="$emit('close')"
      />
      <div class="back" @click="$emit('close')"></div>
    </div>
  </div>
</template>

<script>

import Signup from './Auth/Signup.vue'
import SigninOptions from './Auth/SigninOptions.vue'
import Signin from './Auth/Signin.vue'
import Profile from './Auth/Profile.vue'
import ChangeUsername from './Auth/ChangeUsername.vue'
import ChangeEmail from './Auth/ChangeEmail.vue'
import Confirm from './Auth/Confirm.vue'
import Icon from '../Icon.vue'
import AddTask from './Tasks/AddTask.vue'
import AddTag from './Tags/AddTag.vue'
import AddFilter from './Filters/AddFilter.vue'
import AddTagNote from './Tags/AddTagNote.vue'
import AddList from './Lists/AddList.vue'
import AddListNote from './Lists/AddListNote.vue'
import AddHeadingNote from './Lists/AddHeadingNote.vue'
import Updates from './Updates.vue'
import FastSearch from './FastSearch.vue'
import AddFolder from './Folder/AddFolder.vue'
import RecentData from './Statistics/RecentData.vue'

import { mapGetters, mapState } from 'vuex'

export default {
  components: {
    Signup, SigninOptions, Signin, AddTag, FastSearch,
    AddListNote, AddTagNote, Icon, AddList, AddFilter,
    AddTask, Updates, ChangeUsername, ChangeEmail,
    Confirm, AddHeadingNote, AddFolder, Profile,
    RecentData,
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
    },
  },
  computed: {
    ...mapState(['popup']),
    ...mapGetters(['isPopupOpened', 'platform', 'isDesktop', 'isStandAlone']),
    fillSpace() {
      return !this.isDesktop && !this.popup.naked
    },
  }
}

</script>

<style scoped>

.Popup {
  position: fixed;
  top: 0;
  height: 100%;
  width: 100%;
  z-index: 498;
  overflow: auto;
}

.popup-wrapper {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.Popup.fillSpace .popup-wrapper {
  display: initial;
  justify-content: initial;
  align-items: initial;
}

.Popup.fillSpace .component {
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
