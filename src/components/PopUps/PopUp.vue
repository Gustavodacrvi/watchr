<template>
  <div class='wrapper'>
    <div class='relative-wrapper'>
      <icon v-if='!isDesktop' class='close-icon' icon='arrow-left' size='2x' @click='pushPopUp("")'></icon>
      <component class='pop-up card' :class='[{"round-border": isDesktop, "background-color": !isDesktop}, platform, theme]' :is='popUp'></component>
      <div v-if='isDesktop' class='popup-margin' :class='platform' @click='pushPopUp("")'></div>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { State, Getter, Mutation } from 'vuex-class'

import FontAwesomeIcon from '@/components/FontAwesomeIcon.vue'

@Component({
  components: {
    icon: FontAwesomeIcon,
    SignupPopup: () => import('@/components/PopUps/SignupPopup.vue'),
    SigninPopup: () => import('@/components/PopUps/SigninPopup.vue'),
    LabeladderPopup: () => import('@/components/PopUps/LabeladderPopup.vue'),
  },
})
export default class PopUp extends Vue {
  @State('theme') public readonly theme!: string
  @State('popUpComponent') public readonly popUp!: string
  @Mutation('pushPopUp') public readonly pushPopUp!: (compName: string) => void
  @Getter('isDesktop') public readonly isDesktop!: boolean
  @Getter('platform') public readonly platform!: 'mobile' | 'desktop'
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

.pop-up.mobile {
  width: 100%;
  height: 100%;
}

</style>
