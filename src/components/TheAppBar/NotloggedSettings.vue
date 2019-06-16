<template>
  <div class='theappbar'>
    <div class='auth-banner main-color-card' :class='theme'>
      <button class='auth-button' @click='pushPopUp("SignupPopup")' :class='theme'>SIGN UP</button>
      <button class='auth-button' @click='pushPopUp("SigninPopup")' :class='theme'>SIGN IN</button>
    </div>
    <div class='content-wrapper'>
      <div class='content'>
        <router-link class='link txt' :class='theme' :to='{name: "Home"}' @click.native='closeAppBar'>Home</router-link>
        <router-link class='link txt' :class='theme' :to='{name: "Guest"}' @click.native='closeAppBar'>Guest</router-link>
        <router-link class='link txt' :class='theme' :to='{name: "Help"}' @click.native='closeAppBar'>Help</router-link>
      </div>
    </div>
    <div class='footer-wrapper'>
      <hr class='border'>
      <div class='footer'>
        <div class='left'>
          <icon icon='tasks' @click='changeMenu'></icon>
        </div>
        <div class='right'>
          <icon icon='adjust' @click='changeTheme'></icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'

@Component
export default class LoggedAppnav extends Vue {}

</script>

<style scoped>



</style>
