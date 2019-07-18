<template>
  <div class='component' v-if='perspectiveData'>
    <div class='header' :class='{pointer: !isDesktop}' @dblclick='toggleHide'>
      <header-title
        :value='perspectiveData.name'
        :icon='perspectiveData.icon'
        :icon-color='perspectiveData.iconColor'
        :showing='showing'
        @toggle="$emit('input', !showing)"
      />
      <view-header-icons
        v-model='search'
        :show-task-options='selected && selected.length > 0'
        :allow-search='true'
        :allow-settings='true'
        :allow-labels='true'
        :allow-priority='true'

        @delete='deleteSelected'
        @label='selectLabel'
        @priority='selectPriority'
        @settings='selectSettingsOption'
      />
    </div>
    <div class='margin'></div>
    <div v-if='!hided'>
      <div v-if='showing'>
        <p v-if='perspectiveData.description' class='description txt'>
          {{ perspectiveData.description }}
        </p>
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
        <div class='margin'></div>
      </div>
      <task-renderer
        group='customperspective'
        id='customperspectiveview'
        :default-labels='perspectiveData.includeCustomLabels'
        :default-priority='perspectiveData.priority'
        :tasks='sortedViewTasks'
        :allow-priority='true'
        :allow-labels='true'
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
import { Mutation, Getter, State, namespace } from 'vuex-class'

const labelsVuex = namespace('label')
const persVuex = namespace('perspective')
const taskVuex = namespace('task')

import AppviewHeaderIcons from '@/components/AppViews/AppviewComponents/AppviewHeadericons.vue'
import AppviewTags from '@/components/AppViews/AppviewComponents/AppviewTags.vue'
import AppviewTaskrenderer from '@/components/AppViews/AppviewComponents/AppviewTaskrenderer.vue'
import HeaderTitle from '@/components/AppViews/AppviewComponents/AppviewHeadertitle.vue'

import appUtils from '@/utils/app'

import { Perspective, ListIcon, Label, Task } from '../../../interfaces/app'

@Component({
  components: {
    'view-tags': AppviewTags,
    'view-header-icons': AppviewHeaderIcons,
    'task-renderer': AppviewTaskrenderer,
    'header-title': HeaderTitle,
  },
})
export default class PerspectiveAppview extends Vue {
  @State currentAppSection!: string
  @Getter platform!: string
  @Getter isDesktop!: Perspective | undefined
  @Getter perspectiveData!: Perspective | undefined
  @Mutation pushView!: (obj: {view: string, viewType: string}) => void

  @taskVuex.State tasks!: Task[]
  // tslint:disable-next-line:max-line-length
  @taskVuex.Action addTask!: (obj: {task: Task, perspectiveId: string, position: number, order: string[], collection: string}) => void
  @taskVuex.Action deleteTasksById!: (ids: string[]) => void

  @labelsVuex.State('labels') savedLabels!: Label[]
  @labelsVuex.Getter getLabelsByIds!: (ids: string[]) => Label[]

  @persVuex.Action addLabelToPerspective!: (obj: {id: string, labelId: string}) => Label[]
  @persVuex.Action removeLabelFromPerspective!: (obj: {id: string, labelId: string}) => Label[]
  @persVuex.Action savePerspectivePriority!: (obj: {id: string, priority: string}) => Label[]
  @persVuex.Action saveTaskOrder!: (obj: {order: string[], id: string, collection: string}) => void

  @Prop(String) pers!: string
  @Prop(Boolean) value!: boolean

  search: string = ''
  selected: string[] = []
  loaded: boolean = false
  hided: boolean = false
  showing: boolean = false

  created() {
    this.showing = this.value
    this.updateView()
  }

  updateView() {
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
  onUpdate(ids: string[]) {
    if (this.perspectiveData)
      this.saveTaskOrder({
        order: ids,
        id: this.perspectiveData.id,
        collection: 'customPerspectives',
      })
  }
  addPersTask(obj: {name: string, priority: string, position: number, labels: string[], order: string[]}) {
    if (this.perspectiveData)
      this.addTask({
        task: {
          name: obj.name,
          priority: obj.priority as any,
          labels: obj.labels,
        },
        position: obj.position,
        perspectiveId: this.perspectiveData.id,
        order: obj.order,
        collection: 'customPerspectives',
      } as any)
  }
  selectSettingsOption(value: string) {
    const pers = this.perspectiveData as Perspective
    if (value === 'Sort tasks by name') {
      const tasks: Task[] = this.viewTasks
      tasks.sort((a, b) => a.name.localeCompare(b.name))
      const ids: string[] = []
      for (const el of tasks)
        ids.push(el.id)
      this.saveTaskOrder({
        id: pers.id,
        order: ids,
        collection: 'customPerspectives',
      })
    } else if (value === 'Sort tasks by priority') {
      const tasks = this.viewTasks
      appUtils.sortTasksByPriority(tasks)
      const ids: string[] = []
      for (const el of tasks)
        ids.push(el.id)
      this.saveTaskOrder({
        id: pers.id,
        order: ids,
        collection: 'customPerspectives',
      })
    }
  }
  deleteSelected() {
    this.deleteTasksById(this.selected)
  }

  get viewTasks() {
    if (this.perspectiveData) {
      let tasks = this.tasks
      const pers = this.perspectiveData as Perspective
      if (pers.priority !== '')
        tasks = tasks.filter(el => el.priority === pers.priority)
      if (pers.includeCustomLabels.length > 0)
        tasks = appUtils.filterTasksByLabels(tasks, pers.includeCustomLabels)
      return tasks
    }
    return []
  }
  get sortedViewTasks() {
    if (this.perspectiveData) {
      const ord = appUtils.fixOrder(this.viewTasks, this.perspectiveData.order)
      return appUtils.sortArrayByIds(this.viewTasks, ord)
    }
    return []
  }
  get getPersLabels() {
    if (this.perspectiveData)
      return this.getLabelsByIds(appUtils.fixOrder(this.savedLabels, this.perspectiveData.includeCustomLabels, true))
    return []
  }

  @Watch('$route')
  onChange() {
    this.updateView()
  }
  @Watch('perspectiveData')
  onChange3() {
    this.updateView()
  }
  @Watch('value')
  onChange2() {
    this.showing = this.value
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
