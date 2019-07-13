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
          <span v-for='sect in sections' :key='sect.comp' @click='select(sect)'>
          <i
            :class='`txt pointer icon fas fa-${sect.icon} fa-lg`'
            :style="isActiveClass(sect.comp)"
          ></i>
          </span>
        </div>
        <div style='height: 12px;'></div>
      </div>
      <div class='list-wrapper scroll'>
        <div class='list'>
          <transition
            name='fade'
            mode='out-in'
          >
            <component :is='currentSect'/>
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
          <span @click="$emit('change')">
          <i class='txt pointer icon fas fa-cog fa-lg'></i>
          </span>
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

import appUtil from '@/utils/app'
import { ListIcon } from '../../interfaces/app'

const label = namespace('label')

interface Section {
  icon: string
  comp: string
  options?: ListIcon[]
}

@Component({
  components: {
    // tslint:disable-next-line:max-line-length
    'overview': appUtil.AsyncComponent(import(/* webpackChunkName: "overview-section" */ './AppnavSections/OverviewAppnav.vue')),
    // tslint:disable-next-line:max-line-length
    'labels': appUtil.AsyncComponent(import(/* webpackChunkName: "label-section" */ './AppnavSections/LabelAppnav.vue')),
    // tslint:disable-next-line:max-line-length
    'perspectives': appUtil.AsyncComponent(import(/* webpackChunkName: "perspective-section" */ './AppnavSections/PerspectivesAppnav.vue')),
    // tslint:disable-next-line:max-line-length
    'icon-dropdown': IconDropdown,
  },
})
export default class LoggedAppnav extends Vue {
  @State theme!: string
  @State isLogged!: boolean
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

  created() {
    this.currentSect = this.sections[0].comp
  }

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
