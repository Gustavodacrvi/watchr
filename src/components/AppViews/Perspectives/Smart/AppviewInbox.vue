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
          {{ inboxPers.description }}
        </p>
        <div class='margin'></div>
        <view-tags
          fixed-pers='Inbox'
          :search='search'
          :priority='priority'
          @clearsearch="v => search = ''"
          @clearpriority="v => priority = ''"
        />
        <div class='margin'></div>
      </div>
      <task-renderer
        :tasks='getTasks'
        group='inbox'
        id='appnavinbox'
        fixed-pers='Inbox'
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

import { Component, Vue, Watch } from 'vue-property-decorator'
import { State, Getter, Mutation, namespace } from 'vuex-class'

import DynamicFontawesome from '@/components/DynamicFontawesome.vue'
import DropdownFinder from '@/components/AppViews/AppviewComponents/DropdownFinder.vue'
import IconOptions from '@/components/AppViews/AppviewComponents/AppviewIconoptions.vue'
import AppviewTags from '@/components/AppViews/AppviewComponents/AppviewTags.vue'
import AppviewTaskrenderer from '@/components/AppViews/AppviewComponents/AppviewTaskrenderer.vue'
import HeaderTitle from '@/components/AppViews/AppviewComponents/AppviewHeadertitle.vue'

import { Perspective, Label, Task, ListIcon } from '../../../../interfaces/app'
import appUtils from '@/utils/app'

const labelVuex = namespace('label')
const taskVuex = namespace('task')
const persVuex = namespace('perspective')

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
  @Getter isDesktop!: boolean
  @Getter platform!: string
  @Mutation pushView!: (obj: {view: string, viewType: string}) => void
  @Mutation sendOptionsToNavbar!: (options: ListIcon[]) => void
  @Mutation hideNavBarOptions!: () => void

  @taskVuex.State tasks!: Task[]
  // tslint:disable-next-line:max-line-length
  @taskVuex.Action addTask!: (obj: {task: Task, perspectiveId: string, position: number, order: string[], collection: string}) => void
  @taskVuex.Action deleteTasksById!: (ids: string[]) => void

  @labelVuex.Getter sortedLabels!: Label[]
  @labelVuex.Getter getLabelsByIds!: (ids: string[]) => Label[]

  @persVuex.Getter inboxPers!: Perspective
  @persVuex.Action saveTaskOrder!: (obj: {id: string, order: string[], collection: string}) => void

  search: string = ''
  priority: string = ''
  hided: boolean = false
  showing: boolean = false
  loaded: boolean = false
  selected: string[] = []
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
  mobileSelectedOptions: ListIcon[] = [
    {
      name: 'Delete selected tasks',
      icon: 'trash',
      iconColor: '',
      size: '',
    },
  ]

  created() {
    if (!this.loaded && this.currentAppSection !== 'overview' && this.isDesktop) {
      this.showing = true
      this.loaded = true
    }
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
    if (value === 'Sort inbox tasks by name') {
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
    } else if (value === 'Sort inbox tasks by priority') {
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
  @Watch('currentAppSection')
  onChange2() {
    if (!this.loaded && this.currentAppSection !== 'overview' && this.isDesktop) {
      this.showing = true
      this.loaded = true
    } else this.showing = false
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
