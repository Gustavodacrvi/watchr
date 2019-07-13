<template>
  <div class='component'>
    <div class='header'>
      <header-title
        :value='inboxPers.name'
        :icon='inboxPers.icon'
        :icon-color='inboxPers.iconColor'
      />
      <div class='right'>
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
    <p class='description txt'>
      {{ inboxPers.description }}
    </p>
    <div class='margin'></div>
    <view-tags
      fixed-tag='Inbox'
      :search='search'
      :priority='priority'
      @clearsearch="v => search = ''"
      @clearpriority="v => priority = ''"
    />
    <div class='margin'></div>
    <task-renderer
      :tasks='getTasks'
      group='inbox'
      id='appnavinbox'
      @update='onUpdate'
      @selected='onSelect'
    />
    <task-adder
      fixed-tag='Inbox'
      :allow-priority='true'
    />
    <div class='margin'></div>
    <div class='margin'></div>
    <div class='margin'></div>
    <div class='margin'></div>
    <div class='margin'></div>
    <div class='margin'></div>
    <div class='margin'></div>
    <div class='margin'></div>
    <div class='margin'></div>
    <div class='margin'></div>
    <div class='margin'></div>
    <div class='margin'></div>
    <div class='margin'></div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Watch } from 'vue-property-decorator'
import { State, Getter, Mutation, namespace } from 'vuex-class'

import DynamicFontawesome from '@/components/DynamicFontawesome.vue'
import DropdownFinder from '@/components/AppViews/AppviewComponents/DropdownFinder.vue'
import IconOptions from '@/components/AppViews/AppviewComponents/AppviewIconoptions.vue'
import AppviewTags from '@/components/AppViews/AppviewComponents/AppviewTags.vue'
import TaskAdder from '@/components/AppViews/AppviewComponents/AppviewTaskAdder.vue'
import AppviewTaskrenderer from '@/components/AppViews/AppviewComponents/AppviewTaskrenderer.vue'
import HeaderTitle from '@/components/AppViews/AppviewComponents/AppviewHeadertitle.vue'

import { Perspective, Label, Task, ListIcon } from '../../../interfaces/app'
import appUtils from '@/utils/app'

const labelVuex = namespace('label')
const taskVuex = namespace('task')
const persVuex = namespace('perspective')

@Component({
  components: {
    'drop-finder': DropdownFinder,
    'view-tags': AppviewTags,
    'task-adder': TaskAdder,
    'task-renderer': AppviewTaskrenderer,
    'icon-options': IconOptions,
    'header-title': HeaderTitle,
  },
})
export default class PerspectiveAppview extends Vue {
  @Getter isDesktop!: boolean
  @Mutation pushView!: (obj: {view: string, section: string}) => void

  @taskVuex.State tasks!: Task[]

  @labelVuex.Getter sortedLabels!: Label[]
  @labelVuex.Getter getLabelsByIds!: (ids: string[]) => Label[]

  @persVuex.Getter inboxPers!: Perspective
  @persVuex.Action saveTaskOrder!: (obj: {id: string, order: string[], collection: string}) => void

  search: string = ''
  priority: string = ''
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
    this.pushView({
      view: 'Inbox',
      section: 'overview',
    })
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
      tasks.sort((a, b) => {
        const priA = a.priority
        const priB = b.priority
        switch (priA) {
          case 'Low priority':
            switch (priB) {
              case 'Low priority': return 0
              case 'Medium priority': return 1
              case 'High priority': return 1
              default: return -1
            }
          case 'Medium priority':
            switch (priB) {
              case 'Medium priority': return 0
              case 'High priority': return 1
              case 'Low priority': return -1
              default: return -1
            }
          case 'High priority':
            switch (priB) {
              case 'High priority': return 0
              case 'Low priority': return -1
              case 'Medium priority': return -1
              default: return -1
            }
        }
        return 0
      })
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
  onUpdate(ids: string[]) {
    this.saveTaskOrder({
      id: this.inboxPers.id,
      order: ids,
      collection: 'smartPerspectives',
    })
  }
  onSelect(ids: string) {

  }

  get viewTasks(): Task[] {
    return this.tasks.filter(el => el.labels.length === 0)
  }
  get sortedTasks(): Task[] {
    if (this.inboxPers) {
      const tasks = this.viewTasks
      const order = this.inboxPers.order
      let orderChanged: boolean = false
      for (const task of tasks)
        if (!order.includes(task.id)) {
          order.push(task.id)
          orderChanged = true
        }

      const idsToRemove: string[] = []
      for (const id of order) {
        const task = tasks.find(el => el.id === id)
        if (!task) {
          orderChanged = true
          idsToRemove.push(id)
        }
      }
      for (const id of idsToRemove) {
        const index = order.indexOf(id)
        order.splice(index, 1)
      }
      if (orderChanged)
        this.saveTaskOrder({
          id: this.inboxPers.id,
          collection: 'smartPerspectives',
          order,
        })
      return appUtils.sortArrayByIds(tasks, order)
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
}

</script>

<style scoped>

.header {
  height: 30px;
}

</style>

<style scoped src='@/assets/css/appView.css'>
</style>
