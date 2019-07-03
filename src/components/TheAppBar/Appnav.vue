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
    <div
      class='content-wrapper'
      :class='{topmargin: isLogged}'
    >
      <div class='content'>
        <div class='navsect'>
          <ft-icon v-for='sect in sections'
            :key='sect.comp'
            class='txt pointer icon'
            :icon='sect.icon'
            :style="isActiveClass(sect.comp)"
            @click='currentSect = sect.comp'
            size='lg'
          ></ft-icon>
        </div>
        <div style='height: 12px;'></div>
      </div>
      <div class='list-wrapper scroll'>
        <div class='list'>
          <transition
            name='fade'
            mode='out-in'
          >
            <component :is='currentSect'></component>
          </transition>
          <div class='list-margin'></div>
        </div>
      </div>
    </div>
    <div v-if='!isDesktop'
      class='footer-wrapper'>
      <hr class='border'>
      <div class='footer'>
        <div class='left'>
          <ft-icon
            class='txt pointer icon'
            icon='cog'
            size='lg'
            @click="$emit('change')"
          ></ft-icon>
        </div>
        <div class='right'>
          <ft-icon
            class='txt pointer icon'
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

import LoadingComponent from '@/components/LoadingComponent.vue'
import ErrorComponent from '@/components/ErrorComponent.vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faAdjust, faCog, faHome, faLayerGroup, faProjectDiagram, faStopwatch,
 faStream, faTags, faChartPie } from '@fortawesome/free-solid-svg-icons'

library.add(faAdjust, faCog, faHome, faLayerGroup, faProjectDiagram,
faStopwatch, faStream, faTags, faChartPie)

const AsyncComponent = (compPath: string): any => () => ({
  component: import(`${compPath}`),
  loading: LoadingComponent,
  error: ErrorComponent,
  delay: 200,
  timeout: 5000,
})

interface Section {
  icon: string
  comp: string
}

@Component({
  components: {
    overview: AsyncComponent('./AppnavSections/OverviewAppnav.vue'),
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

<style scoped>

.topmargin {
  margin-top: 50px;
}

</style>
