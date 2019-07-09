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
      :is-default-perspective='isDefaultPerspective'
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
      v-bind='fixedTags'
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

import { SmartPerspective, Label, Task, ListIcon } from '../../interfaces/app'

const labelVuex = namespace('label')
const taskVuex = namespace('task')

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
  @State('perspectiveData') pers!: SmartPerspective
  @Getter isDesktop!: boolean
  @Getter isDefaultPerspective!: boolean

  @taskVuex.State tasks!: Task[]

  @labelVuex.Getter sortedLabels!: Label[]
  @labelVuex.Getter getLabelsByIds!: (ids: string[]) => Label[]

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
  onUpdate(ids: string) {
    console.log('update', ids)
  }
  onSelect(ids: string) {
    console.log('select', ids)
  }

  get fixedTags() {
    if (this.isDefaultPerspective && this.pers)
      return {
        ['fixed-tag']: this.pers.name,
      }
  }
  get getTasks() {
    let tasks: Task[] = this.tasks
    if (this.pers && this.isDefaultPerspective && this.pers.name === 'Inbox')
      tasks = tasks.filter(el => el.labels.length === 0)
    if (this.search)
      tasks = tasks.filter(el => el.name.includes(this.search))
    if (this.priority)
      tasks = tasks.filter(el => el.priority === this.priority)
    return tasks
  }
}

</script>

<style scoped>

.margin {
  height: 25px;
}

.component {
  padding-top: 20px;
}

.header {
  position: relative;
}

.right {
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  display: flex;
}

.header-option {
  margin-right: 10px;
}

.title {
  font-size: 1.5em;
  margin-left: 12px;
  color: #FF6B66;
}

</style>
