<template>
  <div class='component'>
    <div class='header' :class='{pointer: !isDesktop}' @dblclick='toggleHide'>
      <header-title
        :value='inboxPers.name'
        :icon='inboxPers.icon'
        :icon-color='inboxPers.iconColor'
        :showing='showing'
        @toggle='v => showing = !showing'
      />
      <div class='right'>
        <view-header-icons
          v-model='search'
          :show-task-options='selected && selected.length > 0'
          :allow-search='true'
          :allow-settings='true'
          :allow-priority='true'

          @delete='deleteSelected'
          @priority='selectPriority'
          @settings='selectSettingsOption'
        />
      </div>
    </div>
    <div class='margin'></div>
    <div v-if='!hided'>
      <div v-if='showing'>
        <p v-if='inboxPers.description' class='description txt'>
          {{ inboxPers.description }}
        </p>
        <div class='margin'></div>
        <view-tags
          :fixed-pers='inboxPers.name'
          :search='search'
          :priority='priority'
          @clearsearch="v => search = ''"
          @clearpriority="v => priority = ''"
        />
        <div class='margin'></div>
      </div>
      <task-renderer
        group='appnavinbox'
        :id='`appnavinbox`'
        :fixed-pers='inboxPers.name'
        :tasks='getTasks'
        :default-priority='priority'
        :allow-priority='true'
        @update='onUpdate'
        @selected='onSelect'
        @add='addInboxTask'
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

import { Perspective, Label, Task, ListIcon } from '../../../../interfaces/app'
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
  @taskVuex.Action addTask!: (obj: {task: Task, perspectiveId: string, position: number, order: string[], collection: string}) => void
  @taskVuex.Action deleteTasksById!: (ids: string[]) => void

  @labelVuex.Getter getLabelsByIds!: (ids: string[]) => Label[]

  @persVuex.Getter inboxPers!: Perspective
  @persVuex.Action saveTaskOrder!: (obj: {id: string, order: string[], collection: string}) => void

  @Prop(Boolean) value!: boolean

  search: string = ''
  priority: string = ''
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
    this.pushView({
      view: 'Inbox',
      viewType: 'perspective',
    })
  }

  getMobileSelectedOptions(): ListIcon[] {
    for (const icon of this.mobileSelectedOptions)
      icon['callback'] = () => {
        this.deleteTasksById(this.selected)
      }
    return this.mobileSelectedOptions
  }
  addInboxTask({name, priority, position, order}: {name: string, priority: string, position: number, order: string[]}) {
    this.addTask({
      task: {
        name,
        priority,
        labels: [],
      },
      perspectiveId: this.inboxPers.id,
      position, order,
      collection: 'smartPerspectives',
    } as any)
  }
  selectPriority(value: string) {
    this.priority = value
  }
  selectSettingsOption(value: string) {
    if (value === 'Sort tasks by name') {
      const tasks: Task[] = this.viewTasks
      tasks.sort((a, b) => a.name.localeCompare(b.name))
      const ids: string[] = []
      for (const el of tasks)
        ids.push(el.id)
      this.saveTaskOrder({
        id: this.inboxPers.id,
        order: ids,
        collection: 'smartPerspectives',
      })
    } else if (value === 'Sort tasks by priority') {
      const tasks = this.viewTasks
      appUtils.sortTasksByPriority(tasks)
      const ids: string[] = []
      for (const el of tasks)
        ids.push(el.id)
      this.saveTaskOrder({
        id: this.inboxPers.id,
        order: ids,
        collection: 'smartPerspectives',
      })
    }
  }
  toggleHide() {
    if (!this.isDesktop)
      this.hided = !this.hided
  }
  onUpdate(ids: string[]) {
    const filtered = ids.filter(el => el !== 'task-adder')
    if (!appUtils.arraysEqual(filtered, this.inboxPers.order))
      this.saveTaskOrder({
        id: this.inboxPers.id,
        order: ids.filter(el => el !== 'task-adder'),
        collection: 'smartPerspectives',
      })
  }
  onSelect(ids: string[]) {
    this.selected = ids
  }
  deleteSelected() {
    this.deleteTasksById(this.selected)
  }

  get viewTasks(): Task[] {
    return this.tasks.filter(el => el.labels.length === 0)
  }
  get sortedTasks(): Task[] {
    if (this.inboxPers) {
      const ord = appUtils.fixOrder(this.viewTasks, this.inboxPers.order)
      return appUtils.sortArrayByIds(this.viewTasks, ord)
    }
    return []
  }
  get getTasks(): Task[] {
    let tasks: Task[] = this.sortedTasks
    if (this.search)
      tasks = tasks.filter(el => el.name.includes(this.search))
    if (this.priority)
      tasks = tasks.filter(el => el.priority === this.priority)
    return tasks
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
}

</script>

<style scoped>

.header {
  height: 30px;
}

</style>

<style scoped src='@/assets/css/appView.css'>
</style>
