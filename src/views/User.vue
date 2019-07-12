<template>
  <transition name='fade' mode='out-in'>
    <div v-if='loggedAndVerified'
      class='app'
      key='loggedAndVerified'
    >
      <div class='view-wrapper background-color' :class='[platform, theme]'>
        <div class='view' :class='platform'>
          <transition name='fade'>
            <router-view/>
          </transition>
        </div>
      </div>
    </div>
    <div v-else-if='anonymous'
      class='app'
      key='anonymouse'
    >
    </div>
    <div v-else-if='loggedAndNotVerified'
      class='app'
      key='loggedAndNotVerified'
    >
      <div class='content'>
        <div class='gray user-card-wrapper round-border' :class='theme'>
          <div class='user-card'>
            <span class='txt msg'>Please confirm your e-mail before continuing.</span>
            <form-button :waiting-response='waitingResponse' @click='resendConfirmationEmail'>
              Resend confirmation e-mail
            </form-button>
          </div>
        </div>
      </div>
    </div>
    <div v-else
      class='app'
      key='not logged'
    >
      <div class='content'>
        <tab-slider
          flex-basis='700px'
          :options="[
            {name: 'Premium', comp: 'UserPremium'},
            {name: 'Normal', comp: 'UserCreateaccount'},
            {name: 'Anonymous', comp: 'UserAnonymous'},
          ]"
        />
      </div>
    </div>
  </transition>
</template>

<script lang="ts">

import { Component, Prop, Watch, Mixins } from 'vue-property-decorator'
import { Mutation, Getter, State, namespace } from 'vuex-class'
import Mixin from '@/mixins/navBar'

import appUtils from '@/utils/app'

import TabSlider from '@/components/SlidersAndMenus/TabSlider.vue'

import FormButton from '@/components/PopUps/FormComponents/FormButton.vue'
import { Perspective } from '../interfaces/app'

const persVuex = namespace('perspective')

@Component({
  components: {
    'tab-slider': TabSlider,
    'form-button': FormButton,
  },
})
export default class Guest extends Mixins(Mixin) {
  @State theme!: string
  @Getter loggedAndVerified!: boolean
  @Getter loggedAndNotVerified!: boolean
  @Getter anonymous!: boolean
  @Getter isDesktop!: boolean
  @Getter platform!: boolean
  @Mutation openAppBar!: () => void
  @Mutation closeAppBar!: () => void

  @persVuex.Getter pinedSmartPerspectives!: Perspective[]

  waitingResponse: boolean = false
  loaded: boolean = false
  
  created() {
    this.open()
  }

  open() {
    if (this.isDesktop && (this.loggedAndVerified || this.anonymous))
      this.openAppBar()
    else if (this.isDesktop)
      this.closeAppBar()
  }

  @Watch('isDesktop')
  onResize() {
    this.open()
  }
  @Watch('loggedAndVerified')
  onUserChange() {
    this.open()
  }
  @Watch('pinedSmartPerspectives')
  onChange() {
    if (!this.loaded && this.pinedSmartPerspectives[0]) {
      this.$router.replace('user/pers/' + this.pinedSmartPerspectives[0].name.toLowerCase())
      this.loaded = true
    }
  }
}

</script>

<style scoped>

.view-wrapper {
  position: relative;
  width: 100%;
  min-height: 100%;
}

.view-wrapper.desktop {
  margin-left: 300px;
  z-index: 20;
}

.view {
  margin: 0 15px;
}

.view.desktop {
  margin: 0 60px;
}

.app {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
}

.content {
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.user-card-wrapper {
  flex-basis: 700px;
}

.user-card {
  margin: 24px;
}

.msg {
  display: block;
  text-align: center;
  margin-bottom: 14px;
}

</style>
