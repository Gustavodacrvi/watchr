<template>
  <transition name='fade' mode='out-in'>
    <div v-if='loggedAndVerified'
      class='app'
      key='loggedAndVerified'
    >
      <span class='txt'>logged and verified</span>    
    </div>
    <div v-else-if='anonymous'
      class='app'
      key='anonymouse'
    >
      <span class='txt'>logged as anonymous</span>
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
import { Mutation, Getter, State } from 'vuex-class'
import Mixin from '@/mixins/navBar'

import appUtils from '@/utils/app'

import FormButton from '@/components/PopUps/FormComponents/FormButton.vue'

@Component({
  components: {
    'tab-slider': appUtils.AsyncComponent(import('@/components/SlidersAndMenus/TabSlider.vue')),
    'form-button': FormButton,
  },
})
export default class Guest extends Mixins(Mixin) {
  @State theme!: string
  @Getter loggedAndVerified!: boolean
  @Getter loggedAndNotVerified!: boolean
  @Getter anonymous!: boolean
  @Getter isDesktop!: boolean
  @Mutation openAppBar!: () => void
  @Mutation closeAppBar!: () => void

  waitingResponse: boolean = false

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
}

</script>

<style scoped>

.app {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
}

.content {
  margin-top: 60px;
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
