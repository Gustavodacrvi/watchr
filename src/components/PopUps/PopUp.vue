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
    SimpleadderPopup: appUtils.AsyncComponent(import('./SimpleadderPopup.vue')),
    SignupPopup: appUtils.AsyncComponent(import('./SignupPopup.vue')),
    SigninPopup: appUtils.AsyncComponent(import('./SigninPopup.vue')),
    LabeladderPopup: appUtils.AsyncComponent(import('./LabeladderPopup.vue')),
    ResetpasswordPopup: appUtils.AsyncComponent(import('./ResetpasswordPopup.vue')),
    SendresetpasswordPopup: appUtils.AsyncComponent(import('./SendresetpasswordPopup.vue')),
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
