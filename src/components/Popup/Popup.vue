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

import utils from "@/utils/"

const c = utils.asyncComp

import { mapGetters, mapState } from 'vuex'

export default {
  components: {
    Signup: c(import(/* webpackChunkName: "Signup" */ './Auth/Signup.vue')),
    SigninOptions: c(import(/* webpackChunkName: "SigninOptions" */ './Auth/SigninOptions.vue')),
    Signin: c(import(/* webpackChunkName: "Signin" */ './Auth/Signin.vue')),
    AddTag: c(import(/* webpackChunkName: "AddTag" */ './Tags/AddTag.vue')),
    FastSearch: c(import(/* webpackChunkName: "FastSearch" */ './FastSearch.vue')),
    AddListNote: c(import(/* webpackChunkName: "AddListNote" */ './Lists/AddListNote.vue')),
    AddTagNote: c(import(/* webpackChunkName: "AddTagNote" */ './Tags/AddTagNote.vue')),
    AddList: c(import(/* webpackChunkName: "AddList" */ './Lists/AddList.vue')),
    AddFilter: c(import(/* webpackChunkName: "AddFilter" */ './Filters/AddFilter.vue')),
    AddTask: c(import(/* webpackChunkName: "AddTask" */ './Tasks/AddTask.vue')),
    Updates: c(import(/* webpackChunkName: "Updates" */ './Updates.vue')),
    ChangeUsername: c(import(/* webpackChunkName: "ChangeUsername" */ './Auth/ChangeUsername.vue')),
    ChangeEmail: c(import(/* webpackChunkName: "ChangeEmail" */ './Auth/ChangeEmail.vue')),
    Confirm: c(import(/* webpackChunkName: "Confirm" */ './Auth/Confirm.vue')),
    AddHeadingNote: c(import(/* webpackChunkName: "AddHeadingNote" */ './Lists/AddHeadingNote.vue')),
    AddFolder: c(import(/* webpackChunkName: "AddFolder" */ './Folder/AddFolder.vue')),
    Profile: c(import(/* webpackChunkName: "Profile" */ './Auth/Profile.vue')),
    RecentData: c(import(/* webpackChunkName: "RecentData" */ './Statistics/RecentData.vue')),
    Shortcuts: c(import(/* webpackChunkName: "Shortcuts" */ './Shortcuts.vue')),
    AddGroup: c(import(/* webpackChunkName: "AddGroup" */ './Group/AddGroup.vue')),
    InvitePeople: c(import(/* webpackChunkName: "InvitePeople" */ './Group/InvitePeople.vue')),
    SentInvites: c(import(/* webpackChunkName: "SentInvites" */ './Group/SentInvites.vue')),
    Invites: c(import(/* webpackChunkName: "Invites" */ './Group/Invites.vue')),
    Comments: c(import(/* webpackChunkName: "Comments" */ './Group/Comments.vue')),
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
