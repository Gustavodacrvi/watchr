<template>
  <div>
    <div
      class='auth-banner main-color-card'
      :class='theme'
    >
      <button
        class='auth-button'
        @click='pushPopUp("SignupPopup")'
        :class='theme'
      >SIGN UP</button>
      <button
        class='auth-button'
        @click='pushPopUp("SigninPopup")'
        :class='theme'
      >SIGN IN</button>
    </div>
    <div class='content-wrapper'>
      <div class='content'>
        <router-link
          class='link txt'
          :class='theme'
          :to='{name: "Home"}'
          @click.native='closeAppBar'
        >Home</router-link>
        <router-link
          class='link txt'
          :class='theme'
          :to='{name: "Help"}'
          @click.native='closeAppBar'
        >Help</router-link>
        <router-link
          class='link txt'
          :class='theme'
          :to='{name: "User"}'
          @click.native='closeAppBar'
        >User</router-link>
      </div>
    </div>
    <div class='footer-wrapper'>
      <hr class='border'>
      <div class='footer'>
        <div class='left'>
          <ft-icon
            class='icon txt pointer'
            icon='tasks'
            size='lg'
            @click="$emit('change')"
          ></ft-icon>
        </div>
        <div class='right'>
          <ft-icon
            class='icon txt pointer'
            icon='adjust'
            size='lg'
            @click="$emit('theme')"
          ></ft-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { State, Getter, Mutation } from 'vuex-class'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faAdjust, faTasks } from '@fortawesome/free-solid-svg-icons'

library.add(faAdjust, faTasks)

@Component
export default class LoggedAppnav extends Vue {
  @State theme!: string
  @Mutation pushPopUp!: (compName: string) => void
  @Mutation closeAppBar!: () => void
  @Getter isDesktop!: boolean
}

</script>

<style scoped src='@/assets/css/appBarMenu.css'>
</style>
