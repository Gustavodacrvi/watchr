<template>
  <div>
    <div class='auth-banner main-color-card' :class='theme'>
      <button class='auth-button' @click='pushPopUp("SignupPopup")' :class='theme'>SIGN UP</button>
      <button class='auth-button' @click='pushPopUp("SigninPopup")' :class='theme'>SIGN IN</button>
    </div>
    <div class='content-wrapper'>
      <div class='content'>
        <div class='navsect'>
          <icon icon='home'></icon>
          <icon icon='layer-group'></icon>
          <icon icon='project-diagram'></icon>
          <icon icon='stopwatch'></icon>
          <icon icon='stream'></icon>
          <icon icon='tags'></icon>
          <icon icon='chart-pie'></icon>
        </div>
        
      </div>
    </div>
    <div class='footer-wrapper'>
      <hr class='border'>
      <div class='footer'>
        <div class='left'>
          <icon icon='cog' @click='$emit("change", "NotloggedSettings")'></icon>
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
import { State } from 'vuex-class'

import FontAwesomeIcon from '@/components/FontAwesomeIcon.vue'

@Component({
  components: {
    icon: FontAwesomeIcon,
  },
})
export default class LoggedAppnav extends Vue {
  @State('theme') public readonly theme!: string
}

</script>

<style scoped src='@/assets/css/appBarMenu.css'>
</style>
