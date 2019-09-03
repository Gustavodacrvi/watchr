<template>
  <div class='appnav-wrapper' :class='[theme, platform, {scroll: isDesktop}]'>
    <div class='appnav' :class="[platform, theme, backColor]">
      <i v-if="!isDesktop" class="fas fa-arrow-left arrow fa-2x txt pointer icon" :class='theme' @click='$emit("close")'></i>
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
        <div id='search-bar-wrapper'>
          <form-input
            id='search-bar'
            class='medium'
            v-model='search'
            placeholder='Search...'
            :class='[{backcolor: isDesktop}, theme]'
            :disabled='true'
            :max='50'
          />
        </div>
        <div class='content'>
          <div class='navsect'>
            <span v-for='sect in sections' :key='sect.comp' @click='select(sect)'>
            <i
              :class='[`txt pointer icon fas fa-${sect.icon} fa-lg`, theme]'
              :style="isActiveClass(sect.comp)"
              :title='sect.title'
            ></i>
            </span>
          </div>
          <div style='height: 12px;'></div>
        </div>
        <div class='list' :class='platform'>
          <transition
            name='fade'
            mode='out-in'
          >
            <component :is='currentSect' :search='search'/>
          </transition>
          <div class='list-margin'></div>
        </div>
      </div>
    </div>
    <div v-if='showFooter'
      class='footer-wrapper'
      :class='[theme, backColor]'
    >
      <div style='height: 18px;'></div>
      <div class='footer'>
        <div class='left' v-if='!isDesktop'>
          <span @click="$emit('change')">
          <i class='txt pointer icon fas fa-cog fa-lg' :class='theme'></i>
          </span>
        </div>
        <div class='right'>
          <transition name='fade'>
            <icon-options v-if='options && options.length > 0'
              handle='ellipsis-h'
              size='lg'
              min-width='200px'
              :options='options'
              :float-top='true'
            />
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
import FormInput from '@/components/PopUps/FormComponents/FormInput.vue'
import AppviewIconoptions from '@/components/AppViews/AppviewComponents/AppviewIconoptions.vue'

import appUtil from '@/utils/app'
import { ListIcon } from '../../interfaces/app'
import { IndexState, IndexMutations, IndexGetters } from '../../interfaces/store/index'
import { LabelActions } from '../../interfaces/store/label'

const label = namespace('label')

interface Section {
  icon: string
  comp: string
  title: string
  options?: ListIcon[]
}

const c = appUtil.AsyncComponent

@Component({
  components: {
    'icon-options': AppviewIconoptions,
    'icon-dropdown': IconDropdown,
    'form-input': FormInput,
    'overview': c(import('./AppnavSections/OverviewAppnav.vue')),
    'labels': c(import('./AppnavSections/LabelAppnav.vue')),
    'perspectives': c(import('./AppnavSections/PerspectivesAppnav.vue')),
    'projects': c(import('./AppnavSections/ProjectsAppnav.vue')),
  },
})
export default class LoggedAppnav extends Vue {
  @State theme!: IndexState.theme
  @State isLogged!: IndexState.isLogged
  @Mutation pushPopUp!: IndexMutations.PushPopUp
  @Getter isDesktop!: IndexGetters.IsDesktop
  @Getter platform!: IndexGetters.Platform

  @label.Action sortLabelsByName!: LabelActions.SortLabelsByName

  sections: Section[] = [
    {icon: 'home', comp: 'overview', title: 'OVERVIEW'},
    {icon: 'project-diagram', comp: 'projects', title: 'PROJECTS', options: [
      {
        name: 'Add folder',
        icon: 'project-diagram',
        iconColor: '',
        size: 'lg',
        callback: () => {
          this.pushPopUp('AddFolderPopup')
        },
      }
    ]},
    {icon: 'layer-group', comp: 'perspectives', title: 'PERSPECTIVES'},
    {icon: 'tags', comp: 'labels', title: 'LABELS', options: [
      {
        name: 'Sort labels by name',
        icon: 'sort-alpha-down',
        iconColor: '',
        size: 'lg',
        callback: () => {
          this.sortLabelsByName()
        },
      },
      {
        name: 'Add label',
        icon: 'tag',
        iconColor: '',
        size: 'lg',
        callback: () => {
          this.pushPopUp('LabeladderPopup')
        },
      },
    ]},
  ]
  currentSect: string = 'overview'
  search: string = ''
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
      mainColor = '#83B7E2'
    return {
      color: mainColor,
    }
  }

  get backColor() {
    return this.isDesktop ? 'gray' : 'background-color'
  }
  get showFooter() {
    return !this.isDesktop || (this.options && this.options.length > 0 && this.isDesktop)
  }
}

</script>

<style scoped>

#search-bar-wrapper {
  margin: 6px 14px;
}

.backcolor.dark {
  background-color: #121212 !important;
}

.backcolor.light {
  background-color: #fff !important;
}

.margin {
  margin: 8px 0;
}

</style>

<style scoped src='@/assets/css/appBarMenu.css'>
</style>

<style scoped src='@/assets/css/drop.css'>
</style>
