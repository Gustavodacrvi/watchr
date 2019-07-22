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
          :show-task-options='selected && selected.length > 0'
          :allow-search='true'
          :allow-labels='true'
          :allow-settings='true'
          :allow-priority='true'
          
          @delete='deleteSelected'
          @selectedpriority='selectedPriority'
          @selectedlabel='selectLabel'
          @priority='v => priority = v'
          @label='v => labels.push(v.id)'
          @settings='selectSettingsOption'
        />
      </div>
    </div>
    <div class='margin'></div>
    <div v-if='!hided'>
      <div v-if='showing'>
        <div class='margin'></div>
        <view-tags
          :fixed-tag="{name: label, icon: 'tag', backColor: '#83B7E2'}"
          :search='search'
          :labels='getLabels'
          :priority='priority'
          @clearsearch="v => search = ''"
          @clearpriority="v => priority = ''"
          @removelabel='removeLabel'
        />
        <div class='margin'></div>
      </div>
      <task-renderer
        group='label'
        id='appnavlabel'
        :tasks='getTasks'
        :default-priority='priority'
        :default-labels='getLabels.concat([getLabel.id])'
        :allow-priority='true'
        :allow-labels='true'
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

import AppviewHeaderIcons from '@/components/AppViews/AppviewComponents/AppviewHeadericons.vue'
import AppviewTags from '@/components/AppViews/AppviewComponents/AppviewTags.vue'
import AppviewTaskrenderer from '@/components/AppViews/AppviewComponents/AppviewTaskrenderer.vue'
import EmptyTagsRenderer from '@/components/AppViews/AppviewComponents/AppviewEmptytagrenderer.vue'
import HeaderTitle from '@/components/AppViews/AppviewComponents/AppviewHeadertitle.vue'

import appUtils from '@/utils/app'

import { Task, Label, ListIcon } from '../../../interfaces/app'

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
  @State theme!: string
  @State currentAppSection!: string
  @Mutation pushView!: (obj: {view: string, viewType: string}) => void
  @Getter isDesktop!: boolean
  @Getter platform!: string
  @Mutation sendOptionsToNavbar!: (options: ListIcon[]) => void
  @Mutation hideNavBarOptions!: () => void

  @Prop(String) label!: string

  @labelVuex.State('labels') savedLabels!: Label[]
  @labelVuex.Getter getLabelsByIds!: (ids: string[]) => Label[]
  @labelVuex.Action saveLabelTaskOrder!: (obj: {id: string, order: string[]}) => void
  @taskVuex.Action changePrioritysByIds!: (obj: {ids: string[], priority: string}) => void
  @taskVuex.Action addLabelByTaskIds!: (obj: {ids: string[], labelId: string}) => void

  @taskVuex.State tasks!: Task[]
  @taskVuex.Action deleteTasksById!: (ids: string[]) => void
  @taskVuex.Action addTaskLabel!: (obj: {task: Task, labelId: string, position: number, order: string[]}) => void

  search: string = ''
  priority: string = ''
  selected: string[] = []
  labels: string[] = []
  sort: string[] = []
  showing: boolean = false
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
  selectLabel(label: Label) {
    this.addLabelByTaskIds({
      ids: this.selected,
      labelId: label.id,
    })
  }
  toggleHide() {
    this.hided = !this.hided
  }
  removeLabel(id: string) {
    const index = this.labels.findIndex(el => el === id)
    this.labels.splice(index, 1)
  }
  onUpdate(ids: string[]) {
    this.saveLabelTaskOrder({
      order: ids,
      id: this.getLabel.id,
    })
  }
  selectSettingsOption(value: string) {
    if (!this.sort.find(el => el === value))
      if (value === 'Sort tasks by name')
        this.sort.push('name')
      else if (value === 'Sort tasks by priority')
        this.sort.push('priority')
  }
  addLabelTask(obj: {name: string, priority: string, position: number, labels: string[], order: string[]}) {
    this.addTaskLabel({
      task: {
        name: obj.name,
        priority: obj.priority as any,
        labels: obj.labels.concat([this.getLabel.id]),
      },
      position: obj.position,
      labelId: this.getLabel.id,
      order: obj.order,
    } as any)
  }

  get getLabel(): Label {
    const lab: Label = this.savedLabels.find(el => el.name === this.label) as any
    return lab
  }
  get viewTasks(): Task[] {
    return this.tasks.filter(el => el.labels.includes(this.getLabel.id))
  }
  get getLabels(): Label[] {
    return this.getLabelsByIds(this.labels)
  }
  get sortedTasks(): Task[] {
    const ord = appUtils.fixOrder(this.viewTasks, this.getLabel.order)
    return appUtils.sortArrayByIds(this.viewTasks, ord)
  }
  get getTasks(): Task[] {
    let tasks = this.viewTasks
    if (this.search)
      tasks = tasks.filter(el => this.search.includes(el.name))
    if (this.priority)
      tasks = tasks.filter(el => el.priority === this.priority)
    if (this.labels && this.labels.length > 0)
      tasks = appUtils.filterTasksByLabels(tasks, this.labels)
    if (this.sort && this.sort.length > 0)
      tasks = appUtils.sortTasksByMultipleCriteria(tasks, this.sort)
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
