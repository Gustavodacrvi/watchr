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
        <template v-if='isLogged'>
          <span
            class='link txt pointer'
            :class='theme'
            @click='signOut'
          >
            <ft-icon
              class='icon txt '
              icon='sign-out-alt'
              size='sm'
            />
            Sign out
          </span>
          <span v-if='!confirmedEmail'
            class='link txt pointer'
            :class='theme'
            @click='resendConfirmationEmail'
          >
            <ft-icon
              class='icon txt '
              icon='paper-plane'
              size='sm'
            />
            Resend confirmation e-mail
          </span>
        </template>
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

import { Component, Vue, Mixins } from 'vue-property-decorator'
import { State, Getter, Mutation } from 'vuex-class'
import Mixin from '@/mixins/navBar'

import { faAdjust, faTasks, faSignOutAlt, faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'

library.add(faAdjust, faTasks, faSignOutAlt, faPaperPlane)

@Component
export default class LoggedAppnav extends Mixins(Mixin) {
  @State theme!: string
  @Mutation pushPopUp!: (compName: string) => void
  @Mutation closeAppBar!: () => void
  @Getter isDesktop!: boolean
}

</script>

<style scoped src='@/assets/css/appBarMenu.css'>
</style>
