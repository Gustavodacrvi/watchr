<template>
  <div class='component'>
    <div class='header' :class='{pointer: !isDesktop}' @dblclick='toggleHide'>
      <header-title
        :value='pers.name'
        :icon='pers.icon'
        :icon-color='pers.iconColor'
        :showing='showing'
        @toggle='v => showing = !showing'
      />
      <div class='right'>
        <view-header-icons
          v-model='search'
          :show-task-options='selected && selected.length > 0'
          :allow-search='true'
          :allow-settings='true'
          :allow-labels='allowLabels'
          :allow-priority='true'

          @delete='deleteSelected'
          @priority='selectPriority'
          @selectedpriority='selectedPriority'
          @settings='selectSettingsOption'
          @label='addLabel'
        />
      </div>
    </div>
    <div class='margin'></div>
    <div v-if='!hided'>
      <div v-if='showing'>
        <p v-if='pers.description' class='description txt'>
          {{ pers.description }}
        </p>
        <div class='margin'></div>
        <view-tags
          :fixed-pers='pers.name'
          :search='search'
          :priority='getPriority'
          :labels='getLabels'
          @clearsearch="v => search = ''"
          @clearpriority="selectPriority('')"
          @removelabel='removeLabel'
        />
        <div class='margin'></div>
      </div>
      <task-renderer
        group='appnavalltasks'
        id='appnavalltasks'
        :tasks='getTasks'
        :fixed-pers='pers.name'
        :default-priority='getPriority'
        :allow-priority='true'
        :insert-before='true'
        :allow-labels='allowLabels'
        @update='onUpdate'
        @selected='onSelect'
        @add='addPersTask'
      />
    </div>
    <div class='margin-task' :class='platform'></div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Watch, Prop } from 'vue-property-decorator'
import { State, Getter, Mutation, namespace } from 'vuex-class'

import DynamicFontawesome from '@/components/DynamicFontawesome.vue'
import AppviewTags from '@/components/AppViews/AppviewComponents/AppviewTags.vue'
import AppviewHeaderIcons from '@/components/AppViews/AppviewComponents/AppviewHeadericons.vue'
import AppviewTaskrenderer from '@/components/AppViews/AppviewComponents/AppviewTaskrenderer.vue'
import HeaderTitle from '@/components/AppViews/AppviewComponents/AppviewHeadertitle.vue'

import { Perspective, Label, Task, ListIcon } from '../../../interfaces/app'
import appUtils from '@/utils/app'

const labelVuex = namespace('label')
const taskVuex = namespace('task')
const persVuex = namespace('perspective')

@Component({
  components: {
    'view-tags': AppviewTags,
    'task-renderer': AppviewTaskrenderer,
    'view-header-icons': AppviewHeaderIcons,
    'header-title': HeaderTitle,
  },
})
export default class PerspectiveAppview extends Vue {
  @State currentAppSection!: string
  @Getter isDesktop!: boolean
  @Getter platform!: string
  @Mutation pushView!: (obj: {view: string, viewType: string}) => void
  @Mutation sendOptionsToNavbar!: (options: ListIcon[]) => void
  @Mutation hideNavBarOptions!: () => void

  @taskVuex.State tasks!: Task[]
  // tslint:disable-next-line:max-line-length
  @taskVuex.Action addTask!: (obj: {task: Task, perspectiveId: string, position: number, order: string[]}) => void
  @taskVuex.Action deleteTasksById!: (ids: string[]) => void
  @taskVuex.Action changePrioritysByIds!: (obj: {ids: string[], priority: string}) => void

  @labelVuex.Getter getLabelsByIds!: (ids: string[]) => Label[]

  @persVuex.Getter getPerspectiveByName!: (name: string) => Perspective
  @persVuex.Action saveTaskOrder!: (obj: {id: string, order: string[]}) => void
  @persVuex.Action addLabelToPerspective!: (obj: {id: string, labelId: string}) => Label[]
  @persVuex.Action removeLabelFromPerspective!: (obj: {id: string, labelId: string}) => Label[]
  @persVuex.Action savePerspectivePriority!: (obj: {id: string, priority: string}) => Label[]

  @Prop({default: true, type: Boolean}) allowLabels!: boolean
  @Prop(Boolean) value!: boolean
  @Prop(Boolean) save!: boolean
  @Prop(String) persName!: string
  @Prop(Array) baseTasks!: Task[]

  search: string = ''
  priority: string = ''
  labels: string[] = []
  hided: boolean = false
  showing: boolean = false
  loaded: boolean = false
  selected: string[] = []
  mobileSelectedOptions: ListIcon[] = [
    {
      name: 'Delete selected tasks',
      icon: 'trash',
      iconColor: '',
      size: '',
    },
  ]

  created() {
    this.showing = this.value
    this.updateView()
  }

  getMobileSelectedOptions(): ListIcon[] {
    for (const icon of this.mobileSelectedOptions)
      icon['callback'] = () => {
        this.deleteTasksById(this.selected)
      }
    return this.mobileSelectedOptions
  }
  addLabel(label: Label) {
    if (!this.save)
      this.labels.push(label.id)
    else this.addLabelToPerspective({
        id: this.pers.id,
        labelId: label.id,
      })
  }
  removeLabel(id: string) {
    if (!this.save) {
      const index = this.labels.findIndex(el => el === id)
      this.labels.splice(index, 1)
    } else this.removeLabelFromPerspective({
        id: this.pers.id,
        labelId: id,
      })
  }
  addPersTask(obj: {name: string, priority: string, position: number, labels: string[], order: string[]}) {
    this.addTask({
      task: {
        name: obj.name,
        priority: obj.priority,
        labels: obj.labels,
      },
      perspectiveId: this.pers.id,
      position: obj.position, order: obj.order,
    } as any)
  }
  selectPriority(value: string) {
    if (!this.save)
      this.priority = value
    else this.savePerspectivePriority({
        id: this.pers.id,
        priority: value,
      })
  }
  selectSettingsOption(value: string) {
    if (value === 'Sort tasks by name') {
      const tasks: Task[] = this.viewTasks
      tasks.sort((a, b) => a.name.localeCompare(b.name))
      const ids: string[] = []
      for (const el of tasks)
        ids.push(el.id)
      this.saveTaskOrder({
        id: this.pers.id,
        order: ids,
      })
    } else if (value === 'Sort tasks by priority') {
      const tasks = this.viewTasks
      appUtils.sortTasksByPriority(tasks)
      const ids: string[] = []
      for (const el of tasks)
        ids.push(el.id)
      this.saveTaskOrder({
        id: this.pers.id,
        order: ids,
      })
    }
  }
  toggleHide() {
    if (!this.isDesktop)
      this.hided = !this.hided
  }
  onUpdate(ids: string[]) {
    const filtered = ids.filter(el => el !== 'task-adder')
    if (!appUtils.arraysEqual(filtered, this.pers.order))
      this.saveTaskOrder({
        id: this.pers.id,
        order: ids.filter(el => el !== 'task-adder'),
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
  updateView() {
    this.pushView({
      view: this.pers.name,
      viewType: 'perspective',
    })
  }

  get pers(): Perspective {
    return this.getPerspectiveByName(this.persName)
  }
  get viewTasks(): Task[] {
    return this.baseTasks
  }
  get sortedTasks(): Task[] {
    const ord = appUtils.fixOrder(this.viewTasks, this.pers.order)
    return appUtils.sortArrayByIds(this.viewTasks, ord)
  }
  get getTasks(): Task[] {
    let tasks: Task[] = this.sortedTasks
    if (!this.save) {
      if (this.search)
        tasks = tasks.filter(el => el.name.includes(this.search))
      if (this.priority)
        tasks = tasks.filter(el => el.priority === this.priority)
      if (this.labels && this.labels.length > 0)
        tasks = appUtils.filterTasksByLabels(tasks, this.labels)
    }
    return tasks
  }
  get getLabels(): Label[] {
    if (!this.save)
      return this.getLabelsByIds(this.labels)
    else return this.getLabelsByIds(this.pers.includeAndLabels)
  }
  get getPriority(): string {
    if (!this.save)
      return this.priority
    else return this.pers.priority
  }

  @Watch('selected')
  onChange() {
    if (!this.isDesktop)
      if (this.selected.length > 0)
        this.sendOptionsToNavbar(this.getMobileSelectedOptions())
      else this.hideNavBarOptions()
  }
  @Watch('value')
  onChange2() {
    this.showing = this.value
  }
  @Watch('$route')
  onChange4() {
    this.updateView()
  }
  @Watch('perspectiveData')
  onChange3() {
    this.updateView()
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
