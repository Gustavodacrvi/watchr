<template>
  <div v-if='!editing' key='task' class='round-border wrapper' :class="[theme, completed ? 'completed' : 'not-completed']">
    <div
      class='round-border task'
      :class="[theme, completed ? 'completed' : 'not-completed', {'not-selected': !clicked}]"
      @dblclick='toggleEditing'
      @mouseenter='onHover = true'
      @mouseleave='onHover = false'
    >
      <div
        class='content-wrapper'
        @click='toggleChecklist'
        v-long-press='700'
        @long-press-start='toggleElement'
      >
        <span class='circles'>
          <i v-if='!completed' @click='v => completed = true' key='notco' class='far circle icon txt fa-circle fa-sm' :class='theme'></i>
          <i v-else key='com' class='far circle icon txt fa-check-circle fa-sm' :class='theme'></i>
        </span>
        <transition name='check-trans' mode='out-in'>
          <div v-if='!completed' key='cont' class='content' :class='{handle: allowDragAndDrop}'>
            <div class='txt' :class='theme'>
              {{ task.name }}
              <i v-if='task.priority'
                class='content-icon fas fa-exclamation fa-sm'
                :style='{color: exclamationColor}'
              ></i>
              <i v-if='taskLabels && taskLabels.length > 0'
                class='fade content-icon fas fa-tags fa-sm'
              ></i>
            </div>
            <transition name='fade'>
              <div v-if='showLabels' class='txt fade' :class='theme'>
                <span v-for='lab in taskLabels'
                  :key='lab'
                  class='lab'
                >{{ lab }}</span>
              </div>
            </transition>
          </div>
          <div v-else class='content'>
            <span key='compl' class='txt' :class='theme'>Task completed</span>
          </div>
        </transition>
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
    <transition name='fade' mode='out-in'>
      <div v-show='showChecklist' class='details'>
        <span class='txt task-desc' :class='theme'>
          I am the freaking description mother fucker!
        </span>
          <div class='checklist'>
          <transition-group name='fade' tag='div' class='subtasks-transition'>
            <div v-for='todo in checklist'
              class='subtask'
              :key='todo.id'

              :data-vid='todo.id'
            >
              <span class='circles'>
                <i v-if='!completed' key='notco' class='far circle icon txt fa-circle fa-sm' :class='theme'></i>
                <i v-else key='com' class='far circle icon txt fa-check-circle fa-sm' :class='theme'></i>
              </span>
              <span class='txt' :class='theme'>{{ todo.name }}</span>
            </div>
            <div></div>
          </transition-group>
        </div>
      </div>
    </transition>
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
</template>

<script lang='ts'>

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { State, Getter, namespace } from 'vuex-class'

import AppviewIconoptions from '@/components/AppViews/AppviewComponents/AppviewIconoptions.vue'
import TaskEditTemplate from '@/components/AppViews/AppviewComponents/AppviewTaskedit.vue'

import { Task, ListIcon, Label } from '../../../interfaces/app'

const taskVuex = namespace('task')
const labelVuex = namespace('label')
const settingsVuex = namespace('settings')

import LongPress from 'vue-directive-long-press'

import Sortable from 'sortablejs'
 
Vue.directive('long-press', LongPress)

@Component({
  components: {
    'icon-option': AppviewIconoptions,
    'task-edit': TaskEditTemplate,
  },
})
export default class AppviewTask extends Vue {
  @State theme!: string
  @Getter isDesktop!: boolean

  @taskVuex.Action deleteTasksById!: (ids: string[]) => void
  @taskVuex.Action updateTask!: (obj: {name: string, priority: string, id: string}) => void

  @settingsVuex.State mobileTaskLabels!: string
  @settingsVuex.State desktopTaskLabels!: string

  @labelVuex.Getter getLabelsByIds!: (ids: string[]) => Label[]

  @Prop(Object) task!: Task
  @Prop(Boolean) deselectAll!: boolean
  @Prop(Boolean) allowDrag!: boolean
  @Prop(String) fixedPers!: string

  clicked: boolean = false
  onHover: boolean = false
  completed: boolean = false
  test: string = ''
  showChecklist: boolean = false
  justLongPressed: boolean = false
  editing: boolean = false
  sortable: any = null
  checklist: any = [
    {
      name: 'Subtask 1',
      completed: false,
      id: 0,
    },
    {
      name: 'Subtask 2',
      completed: false,
      id: 1,
    },
    {
      name: 'Subtask 3',
      completed: false,
      id: 2,
    },
    {
      name: 'Subtask 4',
      completed: false,
      id: 3,
    },
    {
      name: 'Subtask 5',
      completed: false,
      id: 4,
    },
  ]
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

  mounted() {
    this.mount()
  }

  mount() {
    this.sortable = new Sortable(this.rootSubtaskSelector, {
      disabled: false,
      group: {name: 'subtasks', pull: false, put: false},
      animation: 150,
      dataIdAttr: 'data-sortableid',

      onUpdate: () => {
        console.log(this.getSubtasksIds())
      }
    })
  }
  getSubtasksIds(): string[] {
    const root = this.$el.querySelector('.subtasks-transition')
    if (root) {
      const arr = Array.prototype.slice.call(root.querySelectorAll('[data-vid]'))
      const ids: string[] = []
      for (const el of arr)
        ids.push(el.dataset.vid)
      return ids
    }
    return []
  }
  toggleElement() {
    this.justLongPressed = true
    if (!this.allowDrag)
      this.select()
  }
  toggleChecklist() {
    if (this.allowDrag && !this.justLongPressed)
      this.select()
    else this.showChecklist = !this.showChecklist
    this.justLongPressed = false
  }
  toggleEditing() {
    this.editing = !this.editing
  }
  select() {
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
  get showLabels(): boolean {
    const isNotEmpty = this.taskLabels && this.taskLabels.length > 0
    if (!isNotEmpty)
      return false
    if (this.isDesktop)
      return this.onHover && this.desktopTaskLabels !== 'Always show' || this.desktopTaskLabels === 'Always show'
    else return this.onHover && this.mobileTaskLabels !== 'Always show' || this.mobileTaskLabels === 'Always show'
  }
  get rootSubtaskSelector(): HTMLElement {
    return this.$el.getElementsByClassName('subtasks-transition')[0] as HTMLElement
  }

  @Watch('deselectAll')
  onChange() {
    this.clicked = false
  }
  @Watch('completed')
  onChange2() {
    setTimeout(() => {
      this.deleteTasksById([this.task.id])
    }, 1000)
  }
}

</script>

<style scoped>

.subtask {
  position: relative;
  cursor: pointer;
  height: 30px;
}

.handle {
  float: right;
  margin-right: 12px;
}

.checklist {
  margin-top: 10px;
}

.details {
  margin-left: 36px;
}

.check-trans-leave-active, .check-trans-enter-active {
  transition-duration: .3s;
}

.check-trans-leave, .check-trans-enter-to {
  position: relative;
  bottom: 0;
  opacity: 1;
}

.check-trans-leave-to, .check-trans-enter {
  position: relative;
  bottom: 10px;
  opacity: 0;
}

.completed {
  background-color: #c4ffbd !important;
}

.circles {
  margin: 0 8px;
  margin-left: 4px;
  font-size: 1.2em;
}

.circle {
  transition: color .3s;
}

.wrapper, .task {
  transition: background-color .3s;
}

.task {
  display: flex;
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

.task.not-completed.not-selected.light:hover {
  background-color: #f0f0f0;
}

.task.not-completed.not-selected.dark:hover {
  background-color: #282828;
}

.sortable-selected.not-completed.light {
  background-color: #83B7E2 !important;
}

.sortable-selected.not-completed.dark {
  background-color: #3287cd !important;
}

.content-icon {
  margin: 0 6px;
}

</style>
