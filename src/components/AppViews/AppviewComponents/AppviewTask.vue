<template>
  <transition>
    <div v-if='!editing' key='task'
      class='task round-border'
      :class='theme'
      @dblclick='editing = true'
      @mouseenter='onHover = true'
      @mouseleave='onHover = false'
    >
      <div class='content-wrapper' @click='toggleElement' :class='{handle: allowDragAndDrop}'>
        <div class='content'>
          <div class='txt'>{{ task.name }}
            <i v-if='task.priority'
              class='content-icon fas fa-exclamation fa-sm'
              :style='{color: exclamationColor}'
            ></i>
            <i v-if='taskLabels && taskLabels.length > 0'
              class='fade content-icon fas fa-tags fa-sm'
            ></i>
          </div>
          <transition name='fade'>
            <div v-if='onHover && taskLabels && taskLabels.length > 0' class='txt fade'>
              <span v-for='lab in taskLabels'
                :key='lab'
                class='lab'
              >{{ lab }}</span>
            </div>
          </transition>
        </div>
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
        :fixed-tag='fixedPers'
        :default-labels='task.labels'
        :default-value='task.name'
        :default-priority='task.priority'
        :allow-priority='true'
        :allow-labels='true'
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
import TaskEditTemplate from '@/components/AppViews/AppviewComponents/AppviewTaskedit.vue'

import { Task, ListIcon, Label } from '../../../interfaces/app'

const taskVuex = namespace('task')
const labelVuex = namespace('label')

@Component({
  components: {
    'icon-option': AppviewIconoptions,
    'task-edit': TaskEditTemplate,
  },
})
export default class AppviewTask extends Vue {
  @Prop(Object) task!: Task
  @Prop(Boolean) deselectAll!: boolean
  @Prop(Boolean) allowDrag!: boolean
  @Prop(String) fixedPers!: string

  @State theme!: string
  @Getter isDesktop!: boolean

  @taskVuex.Action deleteTasksById!: (ids: string[]) => void
  @taskVuex.Action updateTask!: (obj: {name: string, priority: string, id: string}) => void

  @labelVuex.Getter getLabelsByIds!: (ids: string[]) => Label[]

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
    this.updateTask({
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
  get taskLabels(): string[] {
    return this.getLabelsByIds(this.task.labels).map(el => el.name)
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

.task-options {
  display: flex;
  align-items: center;
}

.option {
  margin: 0 6px;
}

.lab {
  margin-left: 4px;
}

.fade {
  font-size: .75em;
  opacity: .5;
}

.content-wrapper {
  flex-basis: 100%;
  line-height: 100%;
  margin: 6px 0;
  margin-left: 6px;
  position: relative;
  display: flex;
  align-items: center;
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
