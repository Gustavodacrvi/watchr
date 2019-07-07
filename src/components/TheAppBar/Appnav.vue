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
            @click='select(sect)'
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
    <div
      class='footer-wrapper'
    >
      <hr class='border hr' :class='theme'>
      <div class='footer'>
        <div class='left'>
          <ft-icon v-if='!isDesktop'
            class='txt pointer icon'
            icon='cog'
            size='lg'
            @click="$emit('change')"
          ></ft-icon>
        </div>
        <div class='right'>
          <transition name='fade'>
            <icon-dropdown v-if='options && options.length > 0'
              handle='ellipsis-h'
              size='lg'
              :change-color-on-hover='true'
              min-width='200px'
              :float-top='true'
            >
              <div class='drop round-border'>
                <div v-for='i in options'
                  class='el'
                  :key='i.name'
                  :class='theme'
                  @click='i.callback'
                >
                  <span class='el-icon'>
                    <ft-icon
                      class='txt'
                      :icon='i.icon'
                      :size='i.size'
                    />
                  </span>
                  <span class='el-name txt'>
                    {{ i.name }}
                  </span>
                </div>
              </div>
            </icon-dropdown>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { State, Getter, Mutation, namespace } from 'vuex-class'

import LoadingComponent from '@/components/LoadingComponent.vue'
import ErrorComponent from '@/components/ErrorComponent.vue'
import IconDropdown from '@/components/IconDropdown.vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faAdjust, faCog, faHome, faLayerGroup, faProjectDiagram, faStopwatch,
 faStream, faTags, faChartPie, faEllipsisH, faSortAlphaDown } from '@fortawesome/free-solid-svg-icons'

import appUtil from '@/utils/app'
import { ListIcon } from '../../interfaces/app'

const label = namespace('label')

library.add(faAdjust, faCog, faHome, faLayerGroup, faProjectDiagram,
faStopwatch, faStream, faTags, faChartPie, faEllipsisH, faSortAlphaDown)

interface Section {
  icon: string
  comp: string
  options?: ListIcon[]
}

@Component({
  components: {
    'overview': appUtil.AsyncComponent(import('./AppnavSections/OverviewAppnav.vue')),
    'labels': appUtil.AsyncComponent(import('./AppnavSections/LabelAppnav.vue')),
    'perspectives': appUtil.AsyncComponent(import('./AppnavSections/PerspectivesAppnav.vue')),
    'icon-dropdown': IconDropdown,
  },
})
export default class LoggedAppnav extends Vue {
  @State theme!: string
  @State isLogged!: boolean
  @Mutation pushPopUp!: (compName: string) => void
  @Getter isDesktop!: boolean

  @label.Action sortLabelsByName!: () => void

  sections: Section[] = [
    {icon: 'home', comp: 'overview'},
    {icon: 'layer-group', comp: 'perspectives'},
    {icon: 'project-diagram', comp: 'projects'},
    {icon: 'stopwatch', comp: 'timetracking'},
    {icon: 'stream', comp: 'intervalsandroutines'},
    {icon: 'tags', comp: 'labels', options: [
      {
        name: 'Sort labels by name',
        icon: 'sort-alpha-down',
        iconColor: '',
        size: 'lg',
        callback: () => {
          this.sortLabelsByName()
        },
      },
    ]},
    {icon: 'chart-pie', comp: 'statistics'},
  ]
  currentSect: string = 'overview'
  options: ListIcon[] = []

  select(comp: Section) {
    this.currentSect = comp.comp
    if (comp.options)
      this.options = comp.options
    else this.options = []
  }
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

<style scoped src='@/assets/css/drop.css'>
</style>

<style scoped>

.topmargin {
  margin-top: 50px;
}

</style>
