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
    <empty-tag-renderer v-if='sort && sort.length > 0'
      :list='sort'
      @update='saveNewSortOrder'
    />
    <div class='margin'></div>
    <div v-if='!hided'>
      <div v-if='showing'>
        <p v-if='pers.description' class='description txt' :class='theme'>
          {{ pers.description }}
        </p>
        <div class='margin'></div>
        <view-tags
          :fixed-tag='fixedTag'
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
        id='appnavalltasks'
        :tasks='getTasks'
        :fixed-pers='pers.name'
        :default-priority='getPriority'
        :default-labels='defaultLabels'
        :allow-priority='true'
        :allow-date='allowDate'
        :fix-adder-position='sort.length === 0'
        :insert-before='true'
        :always-show-last-edit-date='pers.alwaysShowLastEditDate'
        :always-show-creation-date='pers.alwaysShowCreationDate'
        :always-show-task-labels='pers.alwaysShowTaskLabels'
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
import EmptyTagsRenderer from '@/components/AppViews/AppviewComponents/AppviewEmptytagrenderer.vue'
import AppviewHeaderIcons from '@/components/AppViews/AppviewComponents/AppviewHeadericons.vue'
import AppviewTaskrenderer from '@/components/AppViews/AppviewComponents/Tasks/AppviewTaskrenderer.vue'
import HeaderTitle from '@/components/AppViews/AppviewComponents/AppviewHeadertitle.vue'

import { Perspective, Label, Task, ListIcon, Alert } from '../../../interfaces/app'
import appUtils from '@/utils/app'

const labelVuex = namespace('label')
const taskVuex = namespace('task')
const persVuex = namespace('perspective')
const set = namespace('settings')

@Component({
  components: {
    'view-tags': AppviewTags,
    'task-renderer': AppviewTaskrenderer,
    'view-header-icons': AppviewHeaderIcons,
    'header-title': HeaderTitle,
    'empty-tag-renderer': EmptyTagsRenderer,
  },
})
export default class PerspectiveAppview extends Vue {
  @State theme!: string
  @State currentAppSection!: string
  @Getter isDesktop!: boolean
  @Getter platform!: string
  @Mutation pushView!: (obj: {view: string, viewType: string}) => void
  @Mutation sendOptionsToNavbar!: (options: ListIcon[]) => void
  @Mutation hideNavBarOptions!: () => void
  @Mutation pushAlert!: (alert: Alert) => void

  @taskVuex.State tasks!: Task[]
  // tslint:disable-next-line:max-line-length
  @taskVuex.Action addTaskPerspective!: (obj: {task: Task, perspectiveId: string, position: number, order: string[]}) => void
  @taskVuex.Action deleteTasksById!: (ids: string[]) => void
  @taskVuex.Action changePrioritysByIds!: (obj: {ids: string[], priority: string}) => void

  @labelVuex.Getter getLabelsByIds!: (ids: string[]) => Label[]

  @persVuex.Getter getPerspectiveByName!: (name: string) => Perspective
  @persVuex.Action saveTaskOrder!: (obj: {id: string, order: string[]}) => void
  @persVuex.Action addLabelToPerspective!: (obj: {id: string, labelId: string}) => Label[]
  @persVuex.Action removeLabelFromPerspective!: (obj: {id: string, labelId: string}) => Label[]
  @persVuex.Action savePerspectivePriority!: (obj: {id: string, priority: string}) => Label[]
  @persVuex.Action addPerspectiveSort!: (obj: {sort: string, perspectiveId: string}) => Label[]
  @persVuex.Action savePerspectiveTaskSort!: (obj: {sort: string[], perspectiveId: string}) => Label[]

  @set.State timeZone!: string

  @Prop({default: true, type: Boolean}) allowLabels!: boolean
  @Prop({default: true, type: Boolean}) allowDate!: boolean
  @Prop(Boolean) value!: boolean
  @Prop(Boolean) save!: boolean
  @Prop(Boolean) saveSort!: boolean
  @Prop(String) persName!: string
  @Prop(Object) fixedTag!: object
  @Prop(Array) baseTasks!: Task[]

  search: string = ''
  priority: string = ''
  labels: string[] = []
  sort: string[] = []
  order: string[] = []
  hided: boolean = false
  showing: boolean = false
  loaded: boolean = false
  selected: string[] = []
  justUpdated: boolean = false
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
    this.showing = this.value
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
            iconColor: '#FF6B66',
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
    this.addTaskPerspective({
      task: {
        name: obj.name,
        priority: obj.priority,
        labels: obj.labels,
      },
      perspectiveId: this.pers.id,
      position: obj.position, order: obj.order,
    } as any)
    this.pushAlert({
      name: 'The task was successfully added.',
      duration: 1.5,
      type: 'success',
    })
  }
  selectPriority(value: string) {
    if (!this.save)
      this.priority = value
    else this.savePerspectivePriority({
        id: this.pers.id,
        priority: value,
      })
  }
  saveNewSortOrder(names: string[]) {
    this.sort = names
    if (this.saveSort)
      this.savePerspectiveTaskSort({
        sort: names,
        perspectiveId: this.pers.id,
      })
  }
  selectSettingsOption(value: string) {
    if (!this.sort.find(el => el === value))
      if (value === 'Sort tasks by name') {
        this.sort.push('name')
        if (this.saveSort)
          this.addPerspectiveSort({
            sort: 'name',
            perspectiveId: this.pers.id,
          })
      } else if (value === 'Sort tasks by priority highest first') {
        this.sort.push('priorityHighest')
        if (this.saveSort)
          this.addPerspectiveSort({
            sort: 'priorityHighest',
            perspectiveId: this.pers.id,
          })
      } else if (value === 'Sort tasks by priority lowest first') {
        this.sort.push('priorityLowest')
        if (this.saveSort)
          this.addPerspectiveSort({
            sort: 'priorityLowest',
            perspectiveId: this.pers.id,
          })
      } else if (value === 'Sort by creation date newest first') {
        this.sort.push('creationDateNewest')
        if (this.saveSort)
          this.addPerspectiveSort({
            sort: 'creationDateNewest',
            perspectiveId: this.pers.id,
          })
      } else if (value === 'Sort by creation date oldest first') {
        this.sort.push('creationDateOldest')
        if (this.saveSort)
          this.addPerspectiveSort({
            sort: 'creationDateOldest',
            perspectiveId: this.pers.id,
          })
      } else if (value === 'Sort by last edit date newest first') {
        this.sort.push('lastEditDateNewest')
        if (this.saveSort)
          this.addPerspectiveSort({
            sort: 'lastEditDateNewest',
            perspectiveId: this.pers.id,
          })
      } else if (value === 'Sort by last edit date oldest first') {
        this.sort.push('lastEditDateOldest')
        if (this.saveSort)
          this.addPerspectiveSort({
            sort: 'lastEditDateOldest',
            perspectiveId: this.pers.id,
          })
      } else if (value === 'Sort tasks by name reversed') {
        this.sort.push('nameReversed')
        if (this.saveSort)
          this.addPerspectiveSort({
            sort: 'nameReversed',
            perspectiveId: this.pers.id,
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
    this.justUpdated = true
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
    this.priority = this.pers.priority
    if (!this.justUpdated && !this.save || this.save) {
      this.labels = this.pers.includeAndLabels.slice()
      this.sort = this.pers.sort.slice()
      this.order = this.pers.order.slice()
    }
    this.justUpdated = false
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
    if (this.search)
      tasks = tasks.filter(el => el.name.includes(this.search))
    if (this.priority)
      tasks = tasks.filter(el => el.priority === this.priority)
    if (this.labels && this.labels.length > 0)
      tasks = appUtils.filterTasksByLabels(tasks, this.labels)
    if (this.order && this.order.length > 0) {
      const ord = appUtils.fixOrder(tasks, this.order)
      tasks = appUtils.sortArrayByIds(tasks, ord)
    }
    if (this.sort && this.sort.length > 0)
      tasks = appUtils.sortTasksByMultipleCriteria(tasks, this.sort)
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
  get defaultLabels(): string[] {
    if (!this.save)
      return this.labels
    return this.pers.includeAndLabels
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
  @Watch('pers')
  onChange3() {
    this.updateView()
  }
  @Watch('currentAppSection')
  onChange6() {
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
