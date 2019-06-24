<template>
  <div class='wrapper'>
    <div class='relative-wrapper'>
      <ft-icon v-if='!isDesktop' class='clone-icon icon pointer txt' icon='arrow-left' size='2x' @click="pushPopUp('')"></ft-icon>
      <component class='pop-up card' :class='[{"round-border": isDesktop, "background-color": !isDesktop}, platform, theme]' :is='popUpComponent'></component>
      <div v-if='isDesktop' class='popup-margin' :class='platform' @click='pushPopUp("")'></div>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { State, Getter, Mutation } from 'vuex-class'

import LoadingComponent from '@/components/LoadingComponent.vue'
import ErrorComponent from '@/components/ErrorComponent.vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'

import appUtils from '../../utils/app';

library.add(faArrowLeft)

const AsyncComponent = (compName: string) => () => ({
  component: import(`${compName}`),
  loading: LoadingComponent,
  error: ErrorComponent,
  delay: 200,
  timeout: 3000,
})

@Component({
  components: {
    SimpleadderPopup: AsyncComponent('@/components/PopUps/SimpleadderPopup.vue') as any,
    SignupPopup: AsyncComponent('/src/components/PopUps/SignupPopup.vue') as any,
    SigninPopup: AsyncComponent('@/components/PopUps/SigninPopup.vue') as any,
    LabeladderPopup: AsyncComponent('@/components/PopUps/LabeladderPopup.vue') as any,
  },
})
export default class PopUp extends Vue {
  @State theme!: string
  @State popUpComponent!: string
  @Mutation pushPopUp!: (compName: string) => void
  @Getter isDesktop!: boolean
  @Getter platform!: 'mobile' | 'desktop'
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
