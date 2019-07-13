<template>
  <div>
    <div v-if='!isLogged'
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
        >Home</router-link>
        <router-link
          class='link txt'
          :class='theme'
          :to='{name: "Settings"}'
        >Settings</router-link>
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
            <i class='icon txt fa-sign-out-alt fas fa-sm'></i>
            Sign out
          </span>
          <span v-if='!emailVerified'
            class='link txt pointer'
            :class='theme'
            @click='resendConfirmationEmail'
          >
            <i class='icon txt fa-paper-plane fas fa-sm'></i>
            Resend confirmation e-mail
          </span>
        </template>
      </div>
    </div>
    <div class='footer-wrapper'>
      <hr class='border hr' :class='theme'>
      <div class='footer'>
        <div v-if='loggedAndVerified' class='left'>
          <span @click="$emit('change')">
          <i class='icon txt pointer fa-tasks fas fa-lg'></i>
          </span>
        </div>
        <div class='right'>
          <span @click="$emit('theme')">
          <i class='icon txt pointer fas fa-adjust fas fa-lg'></i>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Mixins } from 'vue-property-decorator'
import { State, Getter, Mutation } from 'vuex-class'
import Mixin from '@/mixins/navBar'

@Component
export default class LoggedAppnav extends Mixins(Mixin) {
  @State theme!: string
  @State isLogged!: boolean
  @State emailVerified!: boolean
  @Mutation pushPopUp!: (compName: string) => void
  @Mutation closeAppBar!: () => void
  @Getter isDesktop!: boolean
  @Getter loggedAndVerified!: boolean
}

</script>

<style scoped src='@/assets/css/appBarMenu.css'>
</style>
