<template>
  <div>
    <div v-if='!isLogged' class='auth-banner main-color-card' :class='theme'>
      <button class='auth-button' @click='pushPopUp("SignupPopup")' :class='theme'>SIGN UP</button>
      <button class='auth-button' @click='pushPopUp("SigninPopup")' :class='theme'>SIGN IN</button>
    </div>
    <div class='content-wrapper'>
      <div class='content'>
        <div class='navsect'>
          <icon v-for='icon in sectionIcons' :key='icon' :icon='icon' :color='icon === sectionIcon ? "main-color" : ""'></icon>
        </div>
      </div>
    </div>
    <div v-if='!isDesktop' class='footer-wrapper'>
      <hr class='border'>
      <div class='footer'>
        <div class='left'>
          <icon icon='cog' @click='$emit("change")'></icon>
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
import { State, Getter } from 'vuex-class'

import FontAwesomeIcon from '@/components/FontAwesomeIcon.vue'

@Component({
  components: {
    icon: FontAwesomeIcon,
  },
})
export default class LoggedAppnav extends Vue {
  @State('theme') public readonly theme!: string
  @State('isLogged') public readonly isLogged!: boolean
  @Getter('isDesktop') public readonly isDesktop!: boolean

  public readonly sectionIcons: string[] = [
    'home', 'layer-group', 'project-diagram', 'stopwatch', 'stream', 'tags', 'chart-pie',
  ]
  public sectionIcon: string = 'home'
}

</script>

<style scoped src='@/assets/css/appBarMenu.css'>
</style>
