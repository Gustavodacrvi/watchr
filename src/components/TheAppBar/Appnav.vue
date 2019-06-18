<template>
  <div>
    <div v-if='!isLogged' class='auth-banner main-color-card' :class='theme'>
      <button class='auth-button' @click='pushPopUp("SignupPopup")' :class='theme'>SIGN UP</button>
      <button class='auth-button' @click='pushPopUp("SigninPopup")' :class='theme'>SIGN IN</button>
    </div>
    <div class='content-wrapper'>
      <div class='content'>
        <div class='navsect'>
          <icon v-for='sect in sections' :key='sect.name' :icon='sect.icon' :color='currentSect === sect.name ? "#AF92F7" : ""' @click='currentSect = sect.name'></icon>
        </div>
        <hr class='border' style='width: 100%;margin-top:13px;'>
        <div class='section-title'>
          <span>{{ currentSect }}</span>
        </div>
        <transition name='fade'>
          <component :is='currentSect'></component>
        </transition>
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

interface Section {
  name: string
  icon: string
}

@Component({
  components: {
    icon: FontAwesomeIcon,
    overview: () => import('@/components/TheAppBar/AppnavSections/OverviewAppnav.vue'),
  },
})
export default class LoggedAppnav extends Vue {
  @State('theme') public readonly theme!: string
  @State('isLogged') public readonly isLogged!: boolean
  @Getter('isDesktop') public readonly isDesktop!: boolean

  public readonly sections: Section[] = [
    {name: 'overview', icon: 'home'},
    {name: 'perspectives', icon: 'layer-group'},
    {name: 'projects', icon: 'project-diagram'},
    {name: 'time tracking', icon: 'stopwatch'},
    {name: 'intervals and routines', icon: 'stream'},
    {name: 'tags and labels', icon: 'tags'},
    {name: 'statistics', icon: 'chart-pie'},
  ]
  public currentSect: string = 'overview'
}

</script>

<style scoped src='@/assets/css/appBarMenu.css'>
</style>
