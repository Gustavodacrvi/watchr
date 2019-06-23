<template>
  <div>
    <div v-if='!isLogged' class='auth-banner main-color-card' :class='theme'>
      <button class='auth-button' @click='pushPopUp("SignupPopup")' :class='theme'>SIGN UP</button>
      <button class='auth-button' @click='pushPopUp("SigninPopup")' :class='theme'>SIGN IN</button>
    </div>
    <div class='content-wrapper'>
      <div class='content'>
        <div class='navsect'>
          <icon v-for='sect in sections' :key='sect.name' :icon='sect.icon' :color='currentSectName === sect.name ? "#fc7d7d" : ""' @click='currentSect = sect.comp;currentSectName = sect.name' size='lg'></icon>
        </div>
        <hr class='border' style='width: 100%;margin-top:13px;'>
        <transition name='fade' mode='out-in'>
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
import { State, Getter, Mutation } from 'vuex-class'

import FontAwesomeIcon from '@/components/FontAwesomeIcon.vue'

interface Section {
  name: string
  icon: string
  comp: string
}

@Component({
  components: {
    icon: FontAwesomeIcon,
    overview: () => import('@/components/TheAppBar/AppnavSections/OverviewAppnav.vue'),
    labels: () => import('@/components/TheAppBar/AppnavSections/LabelAppnav.vue'),
    perspectives: () => import('@/components/TheAppBar/AppnavSections/PerspectiveAppnav.vue'),
  },
})
export default class LoggedAppnav extends Vue {
  @State('theme') public readonly theme!: string
  @State('isLogged') public readonly isLogged!: boolean
  @Mutation('pushPopUp') public readonly pushPopUp!: (compName: string) => void
  @Getter('isDesktop') public readonly isDesktop!: boolean

  public readonly sections: Section[] = [
    {name: 'OVERVIEW', icon: 'home', comp: 'overview'},
    {name: 'PERSPECTIVES', icon: 'layer-group', comp: 'perspectives'},
    {name: 'PROJECTS', icon: 'project-diagram', comp: 'projects'},
    {name: 'TIME TRACKING', icon: 'stopwatch', comp: 'timetracking'},
    {name: 'INTERVALS AND ROUTINES', icon: 'stream', comp: 'intervalsandroutines'},
    {name: 'LABELS', icon: 'tags', comp: 'labels'},
    {name: 'STATISTICS', icon: 'chart-pie', comp: 'statistics'},
  ]

  public currentSectName: string = 'OVERVIEW'
  public currentSect: string = 'overview'
}

</script>

<style scoped src='@/assets/css/appBarMenu.css'>
</style>
