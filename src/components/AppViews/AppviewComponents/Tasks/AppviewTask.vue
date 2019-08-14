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
      >
        <span class='circles'>
          <i v-if='!completed' @click='v => completed = true' key='notco' class='far circle icon txt fa-circle fa-sm' :class='theme'></i>
          <i v-else key='com' class='far circle icon txt fa-check-circle fa-sm' :class='theme'></i>
        </span>
        <transition name='check-trans' mode='out-in'>
          <div v-if='!completed'
            key='cont'
            class='content'
            :class='{handle: allowDragAndDrop}'
            v-longpress='toggleElement'
            @click='toggleChecklist'
          >
            <div class='txt' :class='theme'>
              {{ task.name }}
              <i v-if='task.priority'
                class='content-icon fas fa-exclamation fa-sm'
                :style='{color: exclamationColor}'
              ></i>
              <i v-if='taskLabels && taskLabels.length > 0'
                class='fade content-icon fas fa-tags fa-sm'
              ></i>
              <i v-if='getChecklist && getChecklist.length > 0'
                class='fade content-icon fas fa-checklist fa-list-ul'
              ></i>
            </div>
            <div key='labels' class='txt info' :class='theme'>
              <template v-if='showLabels'>
                <span v-for='(item, index) in taskLabels'
                  :key='item'
                  class='lab fade'
                >{{ item }}<span v-if='index !== taskLabels.length - 1'>,</span></span>
                <span>&nbsp;</span>
              </template>
              <i v-if='showLastEditDate && showLabels' class='fas tiny-icon fa-circle fa-xs'></i>
              <span v-if='showLastEditDate' class='fade'>
                <span> Last edited {{ readableTaskLastEditDate }} </span>
              </span>
              <i v-if='showLabels && showCreationDate && !showLastEditDate' class='fas tiny-icon fa-circle fa-xs'></i>
              <i v-if='showLastEditDate && showCreationDate' class='fas tiny-icon fa-circle fa-xs'></i>
              <span v-if='showCreationDate' class='fade'>
                <span> Created {{ readableTaskCreationDate }}</span>
              </span>
            </div>
          </div>
          <div v-else class='content'>
            <span key='compl' class='txt' :class='theme'>Task completed</span>
          </div>
        </transition>
      </div>
      <div class='task-options' :class='{handle: allowDragAndDrop}'>
        <transition name='fade'>
          <span class='option' v-if='showOptionsIconDrop'>
            <icon-options
              handle='ellipsis-v'
              size='lg'
              min-width='250px'
              :options='options'
            />
          </span>
        </transition>
      </div>
    </div>
    <transition name='fade' mode='out-in'>
      <div v-show='showChecklist' class='details'>
        <div class='checklist'>
        <transition-group name='fade' tag='div' class='subtasks-transition'>
          <sub-task v-for='todo in getChecklist'
            :key='todo.id'
            :class='theme'
            :task='todo'
            :allow-drag='numberOfSelected > 0'
            :deselect-all='deselect'

            :data-vid='todo.id'
            @toggle='toggleElementSubtask'
          />
          <sub-task-edit key='task-adder' data-vid='task-adder'
            v-model='subtaskValue'
            @add='addTaskSubtask'
          />
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
      :allow-date='true'
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
import TaskEditTemplate from '@/components/AppViews/AppviewComponents/Tasks/AppviewTaskedit.vue'
import SubTask from '@/components/AppViews/AppviewComponents/Tasks/AppviewSubtask.vue'
import SubTaskEdit from '@/components/AppViews/AppviewComponents/Tasks/AppviewSubtaskEdit.vue'

import { Task, ListIcon, Label } from '../../../../interfaces/app'

import appUtils from '@/utils/app'
import moment from 'moment-timezone'

const taskVuex = namespace('task')
const labelVuex = namespace('label')
const settingsVuex = namespace('settings')

import Sortable from 'sortablejs'

import { longClickDirective } from 'vue-long-click'

if (document.body.clientWidth > 992)
  Vue.directive('longpress', longClickDirective({delay: 400, interval: 5000}))
else Vue.directive('longpress', longClickDirective({delay: 1500, interval: 5000}))

@Component({
  components: {
    'icon-options': AppviewIconoptions,
    'task-edit': TaskEditTemplate,
    'sub-task': SubTask,
    'sub-task-edit': SubTaskEdit,
  },
})
export default class AppviewTask extends Vue {
  @State theme!: string
  @Getter isDesktop!: boolean

  @taskVuex.Action deleteTasksById!: (ids: string[]) => void
  @taskVuex.Action updateTask!: (obj: {name: string, priority: string, id: string}) => void
  // tslint:disable-next-line:max-line-length
  @taskVuex.Action addSubTask!: (obj: {name: string, taskId: string, position: number, order: string[]}) => void
  @taskVuex.Action saveSubtaskOrder!: (obj: {taskId: string, order: string[]}) => void
  @taskVuex.Action unCompleteSubtasks!: (taskId: string) => void
  @taskVuex.Action copyTask!: (taskId: string) => void

  @settingsVuex.State timeZone!: string
  @settingsVuex.State timeFormat!: string
  @settingsVuex.State dateFormat!: string

  @labelVuex.Getter getLabelsByIds!: (ids: string[]) => Label[]

  @Prop(Object) task!: Task
  @Prop(Boolean) deselectAll!: boolean
  @Prop(Boolean) allowDrag!: boolean
  @Prop(Boolean) dragging!: boolean
  @Prop(Boolean) alwaysShowLastEditDate!: boolean
  @Prop(Boolean) alwaysShowCreationDate!: boolean
  @Prop(Boolean) alwaysShowTaskLabels!: boolean
  @Prop(String) fixedPers!: string

  clicked: boolean = false
  onHover: boolean = false
  completed: boolean = false
  subtaskValue: string = ''
  deselect: boolean = false
  showChecklist: boolean = false
  justLongPressed: boolean = false
  added: boolean = false
  exactDate: boolean = false
  subTaskAdderPoition: number = 0
  numberOfSelected: number = 0
  editing: boolean = false
  sortable: any = null
  options: ListIcon[] = [
    {
      name: 'Edit task',
      icon: 'edit',
      size: 'lg',
      iconColor: '',
      callback: () => {
        this.editing = true
      },
    },
    {
      name: 'Copy task',
      icon: 'copy',
      size: 'lg',
      iconColor: '',
      callback: () => {
        this.copyTask(this.task.id)
      },
    },
    {
      name: 'Uncomplete subtasks',
      icon: 'list-ul',
      size: 'lg',
      iconColor: '',
      callback: () => {
        this.unCompleteSubtasks(this.task.id)
      },
    },
    {
      name: 'Delete task',
      icon: 'trash',
      size: 'lg',
      iconColor: '',
      callback: () => {
        this.deleteTasksById([this.task.id])
      },
    },
  ]

  mounted() {
    this.mount()
    document.addEventListener('click', this.calcSelectedElements)
  }
  beforeDestroy() {
    document.removeEventListener('click', this.calcSelectedElements)
  }

  mount() {
    const obj: any = {
      disabled: false,
      group: {name: 'subtasks', pull: false, put: false},
      animation: 150,
      multiDrag: true,
      scroll: true,
      selectedClass: 'sortable-selected',
      dataIdAttr: 'data-sortableid',

      onUpdate: () => {
        this.saveSubtaskOrder({
          taskId: this.task.id,
          order: this.getSubtasksIds().filter(el => el !== 'task-adder'),
        })
      },
    }

    if (!this.isDesktop)
      obj['handle'] = '.draghandle'

    this.sortable = new Sortable(this.rootSubtaskComponent, obj)
  }
  addTaskSubtask(val: string) {
    const ids = this.getSubtasksIds()
    this.getSubTaskAdderPosition()
    const order = ids.filter(el => el !== 'task-adder')
    this.addSubTask({
      name: val,
      position: this.subTaskAdderPoition,
      taskId: this.task.id,
      order: this.task.checklistOrder,
    })
    this.added = true
    this.subtaskValue = ''
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
    if (!this.dragging) {
      this.justLongPressed = true
      if (!this.allowDrag)
        this.select()
    }
  }
  toggleChecklist() {
    if (this.allowDrag && !this.justLongPressed)
      this.select()
    if (!this.allowDrag)
      this.showChecklist = !this.showChecklist
    this.justLongPressed = false
  }
  toggleEditing() {
    if (!this.allowDrag)
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
  getSubTaskAdderPosition() {
    const ids = this.getSubtasksIds()
    let position = 0
    let i = 0
    for (const id of ids)
      if (id === 'task-adder') {
        position = i
        break
      } else i++
    this.subTaskAdderPoition = position
  }
  toggleElementSubtask({el, select}: {el: HTMLElement, select: boolean}) {
    if (this.numberOfSelected === 0)
      window.navigator.vibrate(50)
    if (select)
      Sortable.utils.select(el)
    else Sortable.utils.deselect(el)
    this.calcSelectedElements()
  }
  calcSelectedElements(evt?: any) {
    if (evt) {
      const children = this.rootSubtaskComponent.childNodes
      let deSelectAll = true
      for (const child of children)
        if (evt.path.includes(child)) {
          deSelectAll = false
          break
        }
      if (deSelectAll)
        for (const el of evt.path)
        if (el.classList && el.classList.contains('cancel-sortable-unselect')) {
          deSelectAll = false
          break
        }
      if (deSelectAll) {
        for (const child of children)
          Sortable.utils.deselect(child)
        this.deselect = !this.deselect
      }
    }

    this.numberOfSelected = document.querySelectorAll('.sortable-selected').length
  }

  get showLabels(): boolean {
    return this.alwaysShowTaskLabels || this.onHover
  }
  get showLastEditDate(): boolean {
    return this.alwaysShowLastEditDate || this.onHover
  }
  get showCreationDate(): boolean {
    return this.alwaysShowCreationDate || this.onHover
  }
  get readableTaskCreationDate(): string {
    const savedMom = moment.utc(this.task.creationDate, 'Y-M-D HH:mm')
    const todayMom = moment.utc()
    return savedMom.from(todayMom)
  }
  get readableTaskLastEditDate(): string {
    const savedMom = moment.utc(this.task.lastEditDate, 'Y-M-D HH:mm')
    const todayMom = moment.utc()
    return savedMom.from(todayMom)
  }
  get exclamationColor(): string {
    switch (this.task.priority) {
      case 'Low priority': return '#70ff66'
      case 'Medium priority': return '#fff566'
      case 'High priority': return '#FF6B66'
    }
    return ''
  }
  get showOptionsIconDrop(): boolean {
    return !this.isDesktop || (this.onHover && this.isDesktop)
  }
  get allowDragAndDrop(): boolean {
    return this.allowDrag && !this.isDesktop && this.clicked
  }
  get getLabels(): string[] {
    return this.getLabelsByIds(this.task.labels).map(el => el.name)
  }
  get taskLabels(): string[] {
    const labs = this.getLabels
    labs.sort((lab1, lab2) => lab1.localeCompare(lab2))
    return labs
  }
  get rootSubtaskComponent(): HTMLElement {
    return this.$el.getElementsByClassName('subtasks-transition')[0] as HTMLElement
  }
  get getChecklist(): any[] {
    return appUtils.sortArrayByIds(this.task.checklist as any, this.task.checklistOrder)
  }
  get press(): string {
    if (this.isDesktop)
      return 'longpressdesktop'
    return 'longpressmobile'
  }

  @Watch('task')
  onChange3() {
    if (this.added) {
      setTimeout(() => {
        this.getSubTaskAdderPosition()
        const childNodes = this.rootSubtaskComponent.childNodes
        const p = this.subTaskAdderPoition
        const adder = childNodes[p] as any
        const newTask = childNodes[p + 1]
        this.rootSubtaskComponent.insertBefore(newTask, adder)
      }, 10)
      this.added = false
    }
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

.tiny-icon {
  transform: translateY(-20%);
  opacity: .9;
  font-size: .4em;
}

.content {
  width: 100%;
}

.handle {
  float: right;
  margin-right: 12px;
}

.details {
  margin-left: 20px;
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

.completed.task {
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
