<template>
  <div>
    <div class='auth-banner main-color-card' :class='theme'>
      <button class='auth-button' @click='pushPopUp("SignupPopup")' :class='theme'>SIGN UP</button>
      <button class='auth-button' @click='pushPopUp("SigninPopup")' :class='theme'>SIGN IN</button>
    </div>
    <div class='content-wrapper'>
      <div class='content'>
        <router-link class='link txt' :class='theme' :to='{name: "Home"}' @click.native='closeAppBar'>Home</router-link>
        <router-link class='link txt' :class='theme' :to='{name: "Help"}' @click.native='closeAppBar'>Help</router-link>
        <router-link class='link txt' :class='theme' :to='{name: "User"}' @click.native='closeAppBar'>User</router-link>
      </div>
    </div>
    <div class='footer-wrapper'>
      <hr class='border'>
      <div class='footer'>
        <div class='left'>
          <icon icon='tasks' @click='$emit("change")'></icon>
        </div>
        <div class='right'>
          <icon icon='adjust' @click='$emit("theme")'></icon>
        </div>
      </div>
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
  },
})
export default class LoggedAppnav extends Vue {
  @State('theme') public readonly theme!: string
  @Mutation('pushPopUp') public readonly pushPopUp!: (compName: string) => void
  @Mutation('closeAppBar') public readonly closeAppBar!: () => void
  @Getter('isDesktop') public readonly isDesktop!: boolean
}

</script>

<style scoped src='@/assets/css/appBarMenu.css'>
</style>
