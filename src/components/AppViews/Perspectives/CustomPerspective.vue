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
        <span class='header-options'>
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
          <template v-if='search && priority'>
            <div class='margin'></div>
            <view-tags
              :search='search'
              :priority='priority'
              @clearsearch="v => search = ''"
              @clearpriority="v => priority = ''"
            />
          </template>
        </transition>
        <div class='margin'></div>
      </div>
      <task-renderer
        :tasks='getTasks'
        group='inbox'
        id='appnavinbox'
        :allow-priority='true'
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
import { Mutation, Getter, State } from 'vuex-class'

import DynamicFontawesome from '@/components/DynamicFontawesome.vue'
import DropdownFinder from '@/components/AppViews/AppviewComponents/DropdownFinder.vue'
import IconOptions from '@/components/AppViews/AppviewComponents/AppviewIconoptions.vue'
import AppviewTags from '@/components/AppViews/AppviewComponents/AppviewTags.vue'
import AppviewTaskrenderer from '@/components/AppViews/AppviewComponents/AppviewTaskrenderer.vue'
import HeaderTitle from '@/components/AppViews/AppviewComponents/AppviewHeadertitle.vue'

import { Perspective, ListIcon } from '../../../interfaces/app'

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
  @State appBarSection!: string
  @Getter platform!: string
  @Getter isDesktop!: Perspective | undefined
  @Getter perspectiveData!: Perspective | undefined
  @Mutation pushView!: (obj: {view: string, viewType: string}) => void

  @Prop(String) pers!: string

  created() {
    this.pushView({
      view: this.pers,
      viewType: 'perspective',
    })
  }

  search: string = ''
  selected: string[] = []
  priority: string = ''
  showing: boolean = true
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
  
  toggleHide() {
    if (!this.isDesktop)
      this.hided = !this.hided
  }
  selectPriority(value: string) {
    this.priority = value
  }
  onSelect(ids: string[]) {
    this.selected = ids
  }
  onUpdate(ids: string) {

  }
  selectSettingsOption(value: string) {

  }
  addTask({name, priority, position}: {name: string, priority: string, position: number}) {

  }

  get getTasks() {
    return []
  }

  @Watch('$route')
  onChange() {
    this.pushView({
      view: this.$route.params.persname,
      viewType: 'perspective',
    })
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
