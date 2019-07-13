<template>
  <div class='wrapper'>
    <div class='relative-wrapper'>
      <i v-if='!isDesktop' @click="pushPopUp('')" class='close-icon icon pointer txt fas fa-arrow-left fa-2x'></i>
      <transition name='fade' mode='out-in'>
        <component
          class='pop-up card'
          :class="[componentClass, {'stand-alone': isStandAlone}]"
          :is='popUpComponent'
        />
      </transition>
      <div v-if='isDesktop'
        class='popup-margin'
        :class='platform'
        @click='pushPopUp("")'
      ></div>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { State, Getter, Mutation } from 'vuex-class'

import appUtils from '../../utils/app'

@Component({
  components: {
    // tslint:disable-next-line:max-line-length
    SimpleadderPopup: appUtils.AsyncComponent(import(/* webpackChunkName: "simple-adder-popup" */ './SimpleadderPopup.vue')),
    // tslint:disable-next-line:max-line-length
    SignupPopup: appUtils.AsyncComponent(import(/* webpackChunkName: "signup-section" */ './SignupPopup.vue')),
    // tslint:disable-next-line:max-line-length
    SigninPopup: appUtils.AsyncComponent(import(/* webpackChunkName: "signin-popup" */ './SigninPopup.vue')),
    // tslint:disable-next-line:max-line-length
    LabeladderPopup: appUtils.AsyncComponent(import(/* webpackChunkName: "label-adder-popup" */ './LabeladderPopup.vue')),
    // tslint:disable-next-line:max-line-length
    ResetpasswordPopup: appUtils.AsyncComponent(import(/* webpackChunkName: "reset-password-popup" */ './ResetpasswordPopup.vue')),
    // tslint:disable-next-line:max-line-length
    SendresetpasswordPopup: appUtils.AsyncComponent(import(/* webpackChunkName: "send-reset-password-popup" */ './SendresetpasswordPopup.vue')),
  },
})
export default class PopUp extends Vue {
  @State theme!: string
  @State popUpComponent!: string
  @Mutation pushPopUp!: (compName: string) => void
  @Getter isDesktop!: boolean
  @Getter isStandAlone!: boolean
  @Getter platform!: 'mobile' | 'desktop'

  get componentClass(): any[] {
    return [
      {'round-border': this.isDesktop, 'background-color': !this.isDesktop},
      this.platform, this.theme,
    ]
  }
}

</script>

<style scoped>

.wrapper {
  position: fixed;
  height: 110%;
  width: 100%;
  background-color: rgba(0, 0, 0, .4);
  transition: background-color .3s; 
  z-index: 50;
  overflow: auto;
}

.wrapper::-webkit-scrollbar {
  width: 0px;
  background: transparent;
}

.relative-wrapper {
  position: relative;
  height: 130%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.popup-margin {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 49;
}

.close-icon {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 999;
}

.pop-up {
  position: relative;
}

.pop-up.desktop {
  z-index: 60;
  margin-top: 60px;
  flex-basis: 700px;
}

.pop-up.desktop.stand-alone.desktop {
  margin-top: 160px;
}

.pop-up.mobile {
  position: absolute;
  width: 100%;
  height: 100%;
}

</style>
