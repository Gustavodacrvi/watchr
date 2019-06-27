<template>
  <div class='wrapper'>
    <div class='relative-wrapper'>
      <ft-icon v-if='!isDesktop'
        class='close-icon icon pointer txt'
        icon='arrow-left'
        size='2x'
        @click="pushPopUp('')"
      />
      <transition name='fade' mode='out-in'>
        <component
          class='pop-up card'
          :class='componentClass'
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

import LoadingComponent from '@/components/LoadingComponent.vue'
import ErrorComponent from '@/components/ErrorComponent.vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'

import appUtils from '../../utils/app'

library.add(faArrowLeft)

const AsyncComponent = (compPath: string): any => () => ({
  component: import(`${compPath}`),
  loading: LoadingComponent,
  error: ErrorComponent,
  delay: 200,
  timeout: 3000,
})

@Component({
  components: {
    SimpleadderPopup: AsyncComponent('./SimpleadderPopup.vue'),
    SignupPopup: AsyncComponent('./SignupPopup.vue'),
    SigninPopup: AsyncComponent('./SigninPopup.vue'),
    LabeladderPopup: AsyncComponent('./LabeladderPopup.vue'),
    ResetpasswordPopup: AsyncComponent('./ResetpasswordPopup.vue'),
    SendresetpasswordPopup: AsyncComponent('./SendresetpasswordPopup.vue'),
  },
})
export default class PopUp extends Vue {
  @State theme!: string
  @State popUpComponent!: string
  @Mutation pushPopUp!: (compName: string) => void
  @Getter isDesktop!: boolean
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
  position: absolute;
  width: 100%;
  height: 100%;
}

</style>
