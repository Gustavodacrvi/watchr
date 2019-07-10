<template>
  <div class='component'>
    <div class='header'>
      <dynamic-ft-icon
        :icon='pers.icon'
        :style='{color: pers.iconColor}'
        size='2x'
      />
      <span class='title'>
        {{ pers.name }}
      </span>
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
      </div>
    </div>
    <div class='margin'></div>
    <p class='description txt'>
      {{ pers.description }}
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
import { State, Getter, namespace } from 'vuex-class'

import DynamicFontawesome from '@/components/DynamicFontawesome.vue'
import DropdownFinder from '@/components/AppViews/AppviewComponents/DropdownFinder.vue'
import IconOptions from '@/components/AppViews/AppviewComponents/AppviewIconoptions.vue'
import AppviewTags from '@/components/AppViews/AppviewComponents/AppviewTags.vue'
import TaskAdder from '@/components/AppViews/AppviewComponents/AppviewTaskAdder.vue'
import AppviewTaskrenderer from '@/components/AppViews/AppviewComponents/AppviewTaskrenderer.vue'

import { Perspective, Label, Task, ListIcon } from '../../interfaces/app'
import appUtils from '@/utils/app'

const labelVuex = namespace('label')
const taskVuex = namespace('task')
const persVuex = namespace('perspective')

import { library } from '@fortawesome/fontawesome-svg-core'
import { faSearch } from '@fortawesome/free-solid-svg-icons'

library.add(faSearch)

@Component({
  components: {
    'dynamic-ft-icon': DynamicFontawesome,
    'drop-finder': DropdownFinder,
    'view-tags': AppviewTags,
    'task-adder': TaskAdder,
    'task-renderer': AppviewTaskrenderer,
    'icon-options': IconOptions,
  },
})
export default class PerspectiveAppview extends Vue {
  @State('perspectiveData') pers!: Perspective
  @Getter isDesktop!: boolean

  @taskVuex.State tasks!: Task[]

  @labelVuex.Getter sortedLabels!: Label[]
  @labelVuex.Getter getLabelsByIds!: (ids: string[]) => Label[]

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

  selectPriority(value: string) {
    this.priority = value
  }
  onUpdate(ids: string[]) {
    this.saveTaskOrder({
      id: this.pers.id,
      order: ids,
      collection: 'smartPerspectives',
    })
  }
  onSelect(ids: string) {
    console.log('select', ids)
  }

  get viewTasks(): Task[] {
    return this.tasks.filter(el => el.labels.length === 0)
  }
  get sortedTasks(): Task[] {
    if (this.pers) {
      const tasks = this.viewTasks
      const order = this.pers.order
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
          id: this.pers.id,
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

<style scoped src='@/assets/css/appView.css'>
</style>
