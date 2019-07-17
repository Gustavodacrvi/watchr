<template>
  <div class='component' v-if='perspectiveData'>
    <div class='header' :class='{pointer: !isDesktop}' @dblclick='toggleHide'>
      <header-title
        :value='perspectiveData.name'
        :icon='perspectiveData.icon'
        :icon-color='perspectiveData.iconColor'
        :showing='showing'
        @toggle='v => showing = !showing'
      />
      <div class='right'>
        <transition name='fade'>
        <template v-if='selected && selected.length > 0 && isDesktop'>
            <span class='header-options'>
              <i class='fas icon pointer trash fa-trash fa-lg' @click='deleteSelected'></i>
            </span>
          </template>
        </transition>
        <span style='width: 35px'></span>
        <span class='header-option'>
          <drop-finder
            class='icon pointer txt'
            handle='search'
            size='lg'
            min-width='300px'
            v-model='search'
          />
        </span>
        <span class='header-option'>
          <icon-options
            handle='exclamation'
            size='lg'
            min-width='200px'
            :options='priorityOptions'
            @click='selectPriority'
          />
        </span>
        <span class='header-option'>
          <drop-finder
            handle='tags'
            size='lg'
            min-width='300px'
            :list='savedLabels'
            @select='selectLabel'
          />
        </span>
        <span class='header-option'>
          <icon-options
            handle='ellipsis-h'
            size='lg'
            min-width='300px'
            :options='settingsOptions'
            @click='selectSettingsOption'
          />
        </span>
      </div>
    </div>
    <div class='margin'></div>
    <div v-if='!hided'>
      <div v-if='showing'>
        <p class='description txt'>
          {{ perspectiveData.description }}
        </p>
        <transition name='fade'>
          <div v-if='search || perspectiveData.priority || getPersLabels.length > 0'>
            <div class='margin'></div>
            <view-tags
              :search='search'
              :priority='perspectiveData.priority'
              :labels='getPersLabels'
              @clearsearch="v => search = ''"
              @clearpriority="v => priority = ''"
              @removelabel='removeLabel'
            />
          </div>
        </transition>
        <div class='margin'></div>
      </div>
      <task-renderer
        group='inbox'
        id='appnavinbox'
        :default-labels='perspectiveData.includeCustomLabels'
        :default-priority='perspectiveData.priority'
        :tasks='getTasks'
        :allow-priority='true'
        :allow-labels='true'
        @update='onUpdate'
        @selected='onSelect'
        @add='addTask'
      />
    </div>
    <div class='margin-task' :class='platform'></div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Watch, Prop } from 'vue-property-decorator'
import { Mutation, Getter, State, namespace } from 'vuex-class'

const labelsVuex = namespace('label')
const persVuex = namespace('perspective')

import DynamicFontawesome from '@/components/DynamicFontawesome.vue'
import DropdownFinder from '@/components/AppViews/AppviewComponents/DropdownFinder.vue'
import IconOptions from '@/components/AppViews/AppviewComponents/AppviewIconoptions.vue'
import AppviewTags from '@/components/AppViews/AppviewComponents/AppviewTags.vue'
import AppviewTaskrenderer from '@/components/AppViews/AppviewComponents/AppviewTaskrenderer.vue'
import HeaderTitle from '@/components/AppViews/AppviewComponents/AppviewHeadertitle.vue'

import appUtils from '@/utils/app'

import { Perspective, ListIcon, Label } from '../../../interfaces/app'

@Component({
  components: {
    'drop-finder': DropdownFinder,
    'view-tags': AppviewTags,
    'task-renderer': AppviewTaskrenderer,
    'icon-options': IconOptions,
    'header-title': HeaderTitle,
  },
})
export default class PerspectiveAppview extends Vue {
  @State currentAppSection!: string
  @Getter platform!: string
  @Getter isDesktop!: Perspective | undefined
  @Getter perspectiveData!: Perspective | undefined
  @Mutation pushView!: (obj: {view: string, viewType: string}) => void

  @labelsVuex.State('labels') savedLabels!: Label[]
  @labelsVuex.Getter getLabelsByIds!: (ids: string[]) => Label[]

  @persVuex.Action addLabelToPerspective!: (obj: {id: string, labelId: string}) => Label[]
  @persVuex.Action removeLabelFromPerspective!: (obj: {id: string, labelId: string}) => Label[]
  @persVuex.Action savePerspectivePriority!: (obj: {id: string, priority: string}) => Label[]

  @Prop(String) pers!: string

  search: string = ''
  selected: string[] = []
  loaded: boolean = false
  showing: boolean = false
  hided: boolean = false
  priorityOptions: ListIcon[] = [
   {
      name: 'High priority',
      icon: 'exclamation',
      iconColor: '#FF6B66',
      size: 'lg',
    },
    {
      name: 'Medium priority',
      icon: 'exclamation',
      iconColor: '#fff566',
      size: 'lg',
    },
    {
      name: 'Low priority',
      icon: 'exclamation',
      iconColor: '#70ff66',
      size: 'lg',
    },
  ]
  settingsOptions: ListIcon[] = [
   {
      name: 'Sort inbox tasks by name',
      icon: 'sort-alpha-down',
      iconColor: '',
      size: 'lg',
    },
    {
      name: 'Sort inbox tasks by priority',
      icon: 'exclamation',
      iconColor: '',
      size: 'lg',
    },
  ]

  created() {
    if (!this.loaded && this.currentAppSection !== 'overview' && this.isDesktop) {
      this.showing = true
      this.loaded = true
    }
    this.pushView({
      view: this.pers,
      viewType: 'perspective',
    })
  }

  toggleHide() {
    if (!this.isDesktop)
      this.hided = !this.hided
  }
  selectPriority(value: string) {
    if (this.perspectiveData)
      this.savePerspectivePriority({
        id: this.perspectiveData.id,
        priority: value,
      })
  }
  removeLabel(id: string) {
    if (this.perspectiveData)
      this.removeLabelFromPerspective({
        id: this.perspectiveData.id,
        labelId: id,
      })
  }
  selectLabel(label: Label) {
    if (this.perspectiveData)
      this.addLabelToPerspective({
        id: this.perspectiveData.id,
        labelId: label.id,
      })
  }
  onSelect(ids: string[]) {
    this.selected = ids
  }
  onUpdate(ids: string) {

  }
  selectSettingsOption(value: string) {

  }
  addTask(obj: {name: string, priority: string, position: number, labels: string[]}) {

  }

  get getTasks() {
    return []
  }
  get getPersLabels() {
    if (this.perspectiveData)
      return this.getLabelsByIds(appUtils.fixOrder(this.savedLabels, this.perspectiveData.includeCustomLabels, true))
    return []
  }

  @Watch('$route')
  onChange() {
    this.pushView({
      view: this.$route.params.persname,
      viewType: 'perspective',
    })
  }

  @Watch('currentAppSection')
  onChange2() {
    if (!this.loaded && this.currentAppSection !== 'overview' && this.isDesktop) {
      this.showing = true
      this.loaded = true
    }
  }
}

</script>

<style scoped>

.header {
  height: 30px;
}

</style>

<style scoped src='@/assets/css/appView.css'>
</style>
