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
      <div class='right'>
        <view-header-icons
          v-model='search'
          :show-task-options='selected && selected.length > 0'
          :allow-search='true'
          :allow-labels='true'
          :allow-settings='true'
          :allow-priority='true'

          @delete='deleteSelected'
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
          :fixed-label='label'
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

import { Component, Vue, Prop } from 'vue-property-decorator'
import { Getter, namespace } from 'vuex-class'

const taskVuex = namespace('task')
const labelVuex = namespace('label')

import AppviewHeaderIcons from '@/components/AppViews/AppviewComponents/AppviewHeadericons.vue'
import AppviewTags from '@/components/AppViews/AppviewComponents/AppviewTags.vue'
import AppviewTaskrenderer from '@/components/AppViews/AppviewComponents/AppviewTaskrenderer.vue'
import HeaderTitle from '@/components/AppViews/AppviewComponents/AppviewHeadertitle.vue'

import appUtils from '@/utils/app'

import { Task, Label } from '../../../interfaces/app'

@Component({
  components: {
    'view-tags': AppviewTags,
    'view-header-icons': AppviewHeaderIcons,
    'task-renderer': AppviewTaskrenderer,
    'header-title': HeaderTitle,
  },
})
export default class LabelPerspective extends Vue {
  @Getter isDesktop!: boolean
  @Getter platform!: string

  @Prop(String) label!: string

  @labelVuex.State('labels') savedLabels!: Label[]
  @labelVuex.Getter getLabelsByIds!: (ids: string[]) => Label[]
  @labelVuex.Action saveLabelTaskOrder!: (obj: {id: string, order: string[]}) => void

  @taskVuex.State tasks!: Task[]
  @taskVuex.Action deleteTasksById!: (ids: string[]) => void
  @taskVuex.Action addTaskLabel!: (obj: {task: Task, labelId: string, position: number, order: string[]}) => void

  search: string = ''
  priority: string = ''
  selected: string[] = []
  labels: string[] = []
  showing: boolean = false
  hided: boolean = false

  onSelect(ids: string[]) {
    this.selected = ids
  }

  deleteSelected() {
    this.deleteTasksById(this.selected)
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
    if (value === 'Sort tasks by name') {
      const tasks: Task[] = this.viewTasks
      tasks.sort((a, b) => a.name.localeCompare(b.name))
      const ids: string[] = []
      for (const el of tasks)
        ids.push(el.id)
      this.saveLabelTaskOrder({
        id: this.getLabel.id,
        order: ids,
      })
    } else if (value === 'Sort tasks by priority') {
      const tasks = this.viewTasks
      appUtils.sortTasksByPriority(tasks)
      const ids: string[] = []
      for (const el of tasks)
        ids.push(el.id)
      this.saveLabelTaskOrder({
        id: this.getLabel.id,
        order: ids,
      })
    }
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
    return tasks
  }
}

</script>

<style scoped src='@/assets/css/appView.css'>
</style>
