<template>
  <div class='component'>
    <div class='header' :class='{pointer: !isDesktop}' @dblclick='toggleHide'>
      <header-title
        :value='label'
        :showing='showing'
        @toggle='v => showing = !showing'
        
        icon-color=''
        icon=''
      />
      <empty-tag-renderer v-if='sort && sort.length > 0'
        :list='sort'
        @update='v => sort = v'
      />
      <div class='right'>
        <view-header-icons
          v-model='search'
          pers-name=''
          :show-task-options='selected && selected.length > 0'
          :allow-search='true'
          :allow-labels='true'
          :allow-settings='true'
          :allow-smart-perspectives='true'
          :allow-priority='true'
          
          @delete='deleteSelected'
          @selectedpriority='selectedPriority'
          @priority='v => priority = v'
          @label='v => labels.push(v.id)'
          @smartpers='addSmartPers'
          @settings='selectSettingsOption'
        />
      </div>
    </div>
    <div class='margin'></div>
    <div class='margin'></div>
    <div v-if='!hided'>
      <div v-if='showing'>
        <div class='margin'></div>
        <view-tags
          :fixed-tag="{name: label, icon: 'tag', backColor: '#83B7E2'}"
          :search='search'
          :labels='getLabels'
          :priority='priority'
          :smart-pers='smartPers'
          @clearsearch="v => search = ''"
          @clearpriority="v => priority = ''"
          @removelabel='removeLabel'
          @removesmartpers='removeSmartPers'
        />
        <div class='margin'></div>
      </div>
      <task-renderer v-if='getLabel'
        id='appnavlabel'
        :tasks='getTasks'
        :default-priority='priority'
        :default-labels='getLabels.concat([getLabel.id])'
        :allow-priority='true'
        :fix-adder-position='sort.length === 0'
        :insert-before='true'
        :always-show-last-edit-date='true'
        :always-show-creation-date='true'
        :always-show-task-labels='true'
        :allow-labels='true'
        :allow-date='true'
        @update='onUpdate'
        @selected='onSelect'
        @add='addLabelTask'
      />
    </div>
    <div class='margin-task' :class='platform'></div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { Getter, namespace, Mutation, State } from 'vuex-class'

const taskVuex = namespace('task')
const labelVuex = namespace('label')
const set = namespace('settings')

import AppviewHeaderIcons from '@/components/AppViews/AppviewComponents/AppviewHeadericons.vue'
import AppviewTags from '@/components/AppViews/AppviewComponents/AppviewTags.vue'
import AppviewTaskrenderer from '@/components/AppViews/AppviewComponents/Tasks/AppviewTaskrenderer.vue'
import EmptyTagsRenderer from '@/components/AppViews/AppviewComponents/AppviewEmptytagrenderer.vue'
import HeaderTitle from '@/components/AppViews/AppviewComponents/AppviewHeadertitle.vue'

import appUtils from '@/utils/app'

import { Task, Label, ListIcon } from '../../../interfaces/app'
import { IndexState, IndexMutations, IndexGetters } from '../../../interfaces/store/index'
import { LabelState, LabelGetters, LabelActions } from '../../../interfaces/store/label'

@Component({
  components: {
    'view-tags': AppviewTags,
    'view-header-icons': AppviewHeaderIcons,
    'task-renderer': AppviewTaskrenderer,
    'empty-tag-renderer': EmptyTagsRenderer,
    'header-title': HeaderTitle,
  },
})
export default class LabelPerspective extends Vue {
  @State theme!: IndexState.theme
  @State currentAppSection!: IndexState.currentAppSection
  @Mutation pushView!: IndexMutations.PushView
  @Getter isDesktop!: IndexGetters.IsDesktop
  @Getter platform!: IndexGetters.Platform
  @Mutation sendOptionsToNavbar!: IndexMutations.SendOptionsToNavbar
  @Mutation hideNavBarOptions!: IndexMutations.HideNavBarOptions

  @Prop(String) label!: string

  @labelVuex.State('labels') savedLabels!: LabelState.labels
  @labelVuex.Getter getLabelsByIds!: LabelGetters.GetLabelsByIds
  @labelVuex.Action saveLabelTaskOrder!: LabelActions.SaveLabelTaskOrder

  @taskVuex.State tasks!: Task[]
  @taskVuex.Action deleteTasksById!: (ids: string[]) => void
  // tslint:disable-next-line:max-line-length
  @taskVuex.Action addTaskLabel!: (obj: {task: Task, labelId: string, position: number, order: string[]}) => void
  @taskVuex.Action changePrioritysByIds!: (obj: {ids: string[], priority: string}) => void

  @set.State timeZone!: string

  search: string = ''
  priority: string = ''
  selected: string[] = []
  labels: string[] = []
  sort: string[] = []
  smartPers: string[] = []
  showing: boolean = true
  hided: boolean = false
  mobileSelectedOptions: ListIcon[] = [
    {
      name: 'Delete selected tasks',
      icon: 'trash',
      iconColor: '',
      size: '',
    },
    {
      name: 'Change priority of tasks',
      icon: 'exclamation',
      iconColor: '',
      size: '',
    },
  ]

  created() {
    this.updateView()
  }

  getMobileSelectedOptions(): ListIcon[] {
    this.mobileSelectedOptions[0]['callback'] = () => {
      this.deleteTasksById(this.selected)
    }
    this.mobileSelectedOptions[1]['callback'] = () => {
      setTimeout(() => {
        this.sendOptionsToNavbar([
          {
            name: 'High priority',
            icon: 'exclamation',
            iconColor: '#83B7E2',
            size: 'lg',
            callback: () => {
              this.changePrioritysByIds({
                ids: this.selected,
                priority: 'High priority',
              })
              this.sendOptionsToNavbar([])
            },
          },
          {
            name: 'Medium priority',
            icon: 'exclamation',
            iconColor: '#fff566',
            size: 'lg',
            callback: () => {
              this.changePrioritysByIds({
                ids: this.selected,
                priority: 'Medium priority',
              })
              this.sendOptionsToNavbar([])
            },
          },
          {
            name: 'Low priority',
            icon: 'exclamation',
            iconColor: '#70ff66',
            size: 'lg',
            callback: () => {
              this.changePrioritysByIds({
                ids: this.selected,
                priority: 'Low priority',
              })
              this.sendOptionsToNavbar([])
            },
          },
        ])
      }, 80)
    }
    return this.mobileSelectedOptions
  }
  updateView() {
    this.pushView({
      view: this.label,
      viewType: 'label',
    })
  }
  onSelect(ids: string[]) {
    this.selected = ids
  }
  deleteSelected() {
    this.deleteTasksById(this.selected)
  }
  selectedPriority(value: string) {
    this.changePrioritysByIds({
      ids: this.selected,
      priority: value,
    })
  }

  toggleHide() {
    this.hided = !this.hided
  }
  removeLabel(id: string) {
    const index = this.labels.findIndex(el => el === id)
    this.labels.splice(index, 1)
  }
  removeSmartPers(name: string) {
    const index = this.smartPers.findIndex(el => el === name)
    this.smartPers.splice(index, 1)
  }
  onUpdate(ids: string[]) {
    const lab = this.getLabel
    if (lab)
      this.saveLabelTaskOrder({
        order: ids,
        id: lab.id,
      })
  }
  addSmartPers(name: string) {
    if (!this.smartPers.find(el => el === name))
      this.smartPers.push(name)
  }
  selectSettingsOption(value: string) {
    if (!this.sort.find(el => el === value))
      this.sort.push(value)
  }
  addLabelTask(obj: {name: string, priority: string, position: number, labels: string[], order: string[]}) {
    const lab = this.getLabel
    if (lab)
      this.addTaskLabel({
        task: {
          name: obj.name,
          priority: obj.priority as any,
          labels: obj.labels.concat([lab.id]),
        },
        position: obj.position,
        labelId: lab.id,
        order: obj.order,
      } as any)
  }

  get getLabel(): Label {
    const lab: Label = this.savedLabels.find(el => el.name === this.label) as any
    return lab
  }
  get viewTasks(): Task[] {
    const lab = this.getLabel
    if (lab)
      return this.tasks.filter(el => el.labels.includes(lab.id))
    else return []
  }
  get getLabels(): Label[] {
    return this.getLabelsByIds(this.labels)
  }
  get sortedTasks(): Task[] {
    const lab = this.getLabel
    if (lab) {
      const ord = appUtils.fixOrder(this.viewTasks, lab.order)
      return appUtils.sortArrayByIds(this.viewTasks, ord)
    }
    return []
  }
  get getTasks(): Task[] {
    let tasks = this.viewTasks
    if (this.getLabel) {
      if (this.search)
        tasks = tasks.filter(el => this.search.includes(el.name))
      if (this.priority)
        tasks = appUtils.filterTasksByPriority(tasks, this.priority)
      if (this.labels && this.labels.length > 0)
        tasks = appUtils.filterTasksByLabels(tasks, this.labels)
      if (this.smartPers && this.smartPers.length > 0)
        for (const name of this.smartPers)
          tasks = appUtils.filterTasksBySmartPerspective(name, tasks, this.timeZone)
      if (this.getLabel.order && this.getLabel.order.length > 0) {
        const ord = appUtils.fixOrder(tasks, this.getLabel.order)
        tasks = appUtils.sortArrayByIds(tasks, ord)
      }
      if (this.sort && this.sort.length > 0)
        tasks = appUtils.sortTasksByMultipleCriteria(tasks, this.sort)
    }
    return tasks
  }

  @Watch('selected')
  onChange() {
    if (!this.isDesktop)
      if (this.selected.length > 0)
        this.sendOptionsToNavbar(this.getMobileSelectedOptions())
      else this.hideNavBarOptions()
  }
  @Watch('label')
  onChange3() {
    this.updateView()
  }
  @Watch('currentAppSection')
  onChange6() {
    this.updateView()
  }
}

</script>

<style scoped src='@/assets/css/appView.css'>
</style>
