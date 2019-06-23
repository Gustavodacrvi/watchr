<template>
  <div>
    <div v-if='!isLogged' class='auth-banner main-color-card' :class='theme'>
      <button class='auth-button' @click='pushPopUp("SignupPopup")' :class='theme'>SIGN UP</button>
      <button class='auth-button' @click='pushPopUp("SigninPopup")' :class='theme'>SIGN IN</button>
    </div>
    <div class='content-wrapper'>
      <div class='content'>
        <div class='navsect'>
          <ft-icon v-for='sect in sections' :key='sect.comp' class='txt pointer icon' :icon='sect.icon' :style="isActiveClass(sect.comp)" @click='currentSect = sect.comp' size='lg'></ft-icon>
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
          <ft-icon class='txt pointer icon' icon='cog' @click="$emit('change')"></ft-icon>
        </div>
        <div class='right'>
          <ft-icon class='txt pointer icon' icon='adjust' @click="$emit('theme')"></ft-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { State, Getter, Mutation } from 'vuex-class'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faAdjust, faCog, faHome, faLayerGroup, faProjectDiagram, faStopwatch,
 faStream, faTags, faChartPie } from '@fortawesome/free-solid-svg-icons'

library.add(faAdjust, faCog, faHome, faLayerGroup, faProjectDiagram,
faStopwatch, faStream, faTags, faChartPie)

interface Section {
  icon: string
  comp: string
}

@Component({
  components: {
    overview: () => import('@/components/TheAppBar/AppnavSections/OverviewAppnav.vue'),
    labels: () => import('@/components/TheAppBar/AppnavSections/LabelAppnav.vue'),
    perspectives: () => import('@/components/TheAppBar/AppnavSections/PerspectiveAppnav.vue'),
  },
})
export default class LoggedAppnav extends Vue {
  @State theme!: string
  @State isLogged!: boolean
  @Mutation pushPopUp!: (compName: string) => void
  @Getter isDesktop!: boolean

  sections: Section[] = [
    {icon: 'home', comp: 'overview'},
    {icon: 'layer-group', comp: 'perspectives'},
    {icon: 'project-diagram', comp: 'projects'},
    {icon: 'stopwatch', comp: 'timetracking'},
    {icon: 'stream', comp: 'intervalsandroutines'},
    {icon: 'tags', comp: 'labels'},
    {icon: 'chart-pie', comp: 'statistics'},
  ]
  currentSect: string = 'overview'

  isActiveClass(comp: string): object {
    let mainColor: string = ''
    if (this.currentSect === comp)
      mainColor = '#fc7d7d'
    return {
      color: mainColor,
    }
  }
}

</script>

<style scoped src='@/assets/css/appBarMenu.css'>
</style>
