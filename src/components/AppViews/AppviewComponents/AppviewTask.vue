<template>
  <transition>
    <div v-if='!editing' key='task'
      class='task round-border'
      :class='theme'
      @dblclick='editing = true'
      @mouseenter='onHover = true'
      @mouseleave='onHover = false'
    >
      <div class='content' @click='toggleElement' :class='{handle: allowDragAndDrop}'>
        <span class='txt'>{{ task.name }}
          <i v-if='task.priority'
            class='content-icon fas fa-exclamation fa-sm'
            :style='{color: exclamationColor}'
          ></i>
        </span>
      </div>
      <div class='task-options' :class='{handle: allowDragAndDrop}'>
        <transition name='fade'>
          <span class='option' v-if='showOptionsIconDrop'>
            <icon-option
              handle='ellipsis-v'
              size='lg'
              min-width='200px'
              :options='options'
            />
          </span>
        </transition>
      </div>
    </div>
    <div key='editing' v-else>
      <task-edit key='showing'
        :task='task'
        :fixed-tag='fixedTag'
        :allow-priority='allowPriority'
        btn='Edit task'
        @cancel='editing = false'
        @enter='enter'
      />
    </div>
  </transition>
</template>

<script lang='ts'>

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { State, Getter, namespace } from 'vuex-class'

import AppviewIconoptions from '@/components/AppViews/AppviewComponents/AppviewIconoptions.vue'
import TaskEditTemplate from '@/components/AppViews/AppviewComponents/AppviewTagedit.vue'

import { Task, ListIcon } from '../../../interfaces/app'

const taskVuex = namespace('task')

@Component({
  components: {
    'icon-option': AppviewIconoptions,
    'task-edit': TaskEditTemplate,
  },
})
export default class AppviewTask extends Vue {
  @Prop(Object) task!: Task
  @Prop(Boolean) deselectAll!: boolean
  @Prop(Boolean) allowPriority!: boolean
  @Prop(Boolean) allowDrag!: boolean
  @Prop(String) fixedTag!: string

  @State theme!: string
  @Getter isDesktop!: boolean

  @taskVuex.Action deleteTasksById!: (ids: string[]) => void
  @taskVuex.Action updateLabel!: (obj: {name: string, priority: string, id: string}) => void

  clicked: boolean = false
  onHover: boolean = false
  editing: boolean = false
  options: ListIcon[] = [
    {
      name: 'Delete task',
      icon: 'trash',
      size: 'lg',
      iconColor: '',
      callback: () => {
        this.deleteTasksById([this.task.id])
      },
    },
    {
      name: 'Edit task',
      icon: 'edit',
      size: 'lg',
      iconColor: '',
      callback: () => {
        this.editing = true
      },
    },
  ]

  toggleElement() {
    this.clicked = !this.clicked
    const el: HTMLElement = this.$el as HTMLElement
    this.$emit('toggle', {
      el,
      select: this.clicked,
    })
  }
  enter(obj: {name: string, priority: string}) {
    this.updateLabel({
      ...obj,
      id: this.task.id,
    })
    this.editing = false
  }

  get exclamationColor() {
    switch (this.task.priority) {
      case 'Low priority': return '#70ff66'
      case 'Medium priority': return '#fff566'
      case 'High priority': return '#FF6B66'
    }
  }
  get showOptionsIconDrop(): boolean {
    return !this.isDesktop || (this.onHover && this.isDesktop)
  }
  get allowDragAndDrop(): boolean {
    return this.allowDrag && !this.isDesktop
  }

  @Watch('deselectAll')
  onChange() {
    this.clicked = false
  }
}

</script>

<style scoped>

.task {
  display: flex;
  transition: background-color .3s;
  cursor: pointer;
  min-height: 40px;
}

.content, .task-options {
  display: flex;
  align-items: center;
}

.option {
  margin: 0 6px;
}

.content {
  flex-basis: 100%;
  margin: 6px 0;
  margin-left: 6px;
}

.sortable-selected.light {
  background-color: #ffbfbd !important;
}

.sortable-selected.dark {
  background-color: #3B2B2A !important;
}

.task.light:hover {
  background-color: #e3e3e3;
}

.task.dark:hover {
  background-color: #282828;
}

.content-icon {
  margin: 0 6px;
}

</style>
