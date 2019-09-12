<template>
  <div v-if='!editing' key='task' class='round-border wrapper' :class='theme'>
    <div
      class='round-border task'
      :class="[theme, {'not-selected': !clicked, done: done, undone: !done}]"
      @dblclick='toggleEditing'
      @mouseenter='onHover = true'
      @mouseleave='onHover = false'
    >
      <div
        class='content-wrapper'
      >
        <span class='circles' @click='toggleTaskComplete'>
          <i v-show='!task.completed' class='far circle icon txt fa-circle fa-sm' :class='theme'></i>
          <i v-show='task.completed' class='far fade circle icon txt fa-check-circle fa-sm' :class='theme'></i>
        </span>
        <transition name='check-trans' mode='out-in'>
          <div
            key='cont'
            class='content'
            :class='{handle: allowDragAndDrop}'
            v-longpress='toggleElement'
            @click='toggleChecklist'
          >
            <div class='txt' :class='[theme, {fade: task.completed}]'>
              <i v-if='showTodayIcon' class='txt fas fa-star fa-sm' style='color: #FFE366'></i>
              <i v-else-if='showOverdueIcon' class='txt fas fa-hourglass-end fa-sm' style='color: #FF6B66'></i>
              <i v-else-if='showTomorrowIcon' class='txt fas fa-sun fa-sm' style='color: #ffa166'></i>
              <span v-if="showProjectName && getProject" class="txt-tag gray txt round-border" :class="theme">{{ getProject.name }}</span>
              <span v-if="date" class="txt-tag gray txt round-border" :class="theme">{{ date }}</span>
              <span v-if="time" class="txt-tag gray txt round-border" :class="theme">{{ time }}</span>
              {{ task.name }}
              <i v-if='task.priority'
                class='content-icon fas fa-exclamation fa-sm'
                :style='{color: exclamationColor}'
              ></i>
              <i v-if='getChecklist && getChecklist.length > 0'
                class='fade content-icon fas fa-checklist fa-list-ul'
              ></i>
            </div>
            <transition
              name='info-fade'
              @beforeLeave='saveHeight'
              @beforeEnter='saveHeight'
              @enter='applyHeight'
              @leave='applyHeightLeave'
              @afterEnter='setDefault'
              @afterLeave='setDefault'
            >
              <div v-if='showLabels || showLastEditDate || showCreationDate' key='labels' class='txt info' :class='theme'>
                <template v-if='showLabels'>
                  <span v-for='(item, index) in taskLabels'
                    :key='item'
                    class='lab fade tiny'
                  >{{ item }}<span v-if='index !== taskLabels.length - 1'>,</span></span>
                  <span>&nbsp;</span>
                </template>
                <i v-if='showDot1' class='fas tiny-icon fa-circle fa-xs'></i>
                <span v-if='showLastEditDate' class='fade tiny'>
                  <span> Last edited {{ readableTaskLastEditDate }} </span>
                </span>
                <i v-if='showDot2' class='fas tiny-icon fa-circle fa-xs'></i>
                <span v-if='showCreationDate' class='fade tiny'>
                  <span> Created {{ readableTaskCreationDate }}</span>
                </span>
              </div>
            </transition>
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
      :default-labels='task.labels'
      :default-value='task.name'
      :default-priority='task.priority'
      :default-project='getProject'
      :allow-priority='true'
      :allow-labels='true'
      :allow-date='true'
      :allow-project='true'
      :date='task.date'
      :time='task.time'
      btn='Edit task'
      @cancel='editing = false'
      @enter='enter'
    />
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { State, Getter, Mutation, namespace } from 'vuex-class'

import AppviewIconoptions from '@/components/AppViews/AppviewComponents/AppviewIconoptions.vue'
import TaskEditTemplate from '@/components/AppViews/AppviewComponents/Tasks/AppviewTaskedit.vue'
import SubTask from '@/components/AppViews/AppviewComponents/Tasks/AppviewSubtask.vue'
import SubTaskEdit from '@/components/AppViews/AppviewComponents/Tasks/AppviewSubtaskEdit.vue'

import { Task, ListIcon, Label, Project } from '../../../../interfaces/app'

import appUtils from '@/utils/app'
import moment from 'moment-timezone'

const taskVuex = namespace('task')
const labelVuex = namespace('label')
const projectVuex = namespace('project')
const settingsVuex = namespace('settings')

import Sortable from 'sortablejs'

import { longClickDirective } from 'vue-long-click'
import { IndexState, IndexGetters, IndexMutations } from '../../../../interfaces/store/index'
import { LabelGetters } from '../../../../interfaces/store/label'
import { SetState } from '../../../../interfaces/store/settings'
import { TaskActions } from '../../../../interfaces/store/task'
import { ProjectGetters } from '../../../../interfaces/store/project'

if (document.body.clientWidth > 992)
  Vue.directive('longpress', longClickDirective({delay: 300, interval: 5000}))
else Vue.directive('longpress', longClickDirective({delay: 1200, interval: 5000}))

@Component({
  components: {
    'icon-options': AppviewIconoptions,
    'task-edit': TaskEditTemplate,
    'sub-task': SubTask,
    'sub-task-edit': SubTaskEdit,
  },
})
export default class AppviewTask extends Vue {
  @State theme!: IndexState.theme
  @Mutation pushPopUp!: IndexMutations.PushPopUp
  @Mutation pushPopUpPayload!: IndexMutations.PushPopUpPayload
  @Getter isDesktop!: IndexGetters.IsDesktop

  @taskVuex.Action deleteTasksById!: TaskActions.DeleteTasksById
  @taskVuex.Action updateTask!: TaskActions.UpdateTask
  @taskVuex.Action addSubTask!: TaskActions.AddSubTask
  @taskVuex.Action toggleCompleteTask!: TaskActions.ToggleCompleteTask
  @taskVuex.Action saveSubtaskOrder!: TaskActions.SaveSubtaskOrder
  @taskVuex.Action unCompleteSubtasks!: TaskActions.UnCompleteSubtasks
  @taskVuex.Action copyTask!: TaskActions.CopyTask
  @taskVuex.Action removeTasksFromProject!: TaskActions.RemoveTasksFromProject

  @settingsVuex.State timeZone!: SetState.timeZone
  @settingsVuex.State timeFormat!: SetState.timeFormat
  @settingsVuex.State dateFormat!: SetState.dateFormat

  @labelVuex.Getter getLabelsByIds!: LabelGetters.GetLabelsByIds

  @projectVuex.Getter getProjectById!: ProjectGetters.GetProjectById

  @Prop({default: true, type: Boolean}) showProjectName!: boolean
  @Prop(Object) task!: Task
  @Prop(Boolean) deselectAll!: boolean
  @Prop(Boolean) dragging!: boolean
  @Prop(Boolean) allowDrag!: boolean
  @Prop(Boolean) alwaysShowLastEditDate!: boolean
  @Prop(Boolean) alwaysShowCreationDate!: boolean
  @Prop(Boolean) alwaysShowTaskLabels!: boolean
  @Prop(Boolean) isOnProject!: boolean
  @Prop(String) fixedPers!: string
  @Prop(Object) defaultProject!: Project
  @Prop(String) parentId!: string

  clicked: boolean = false
  onHover: boolean = false
  done: boolean = false
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
  infoHeight: number = 0

  mounted() {
    this.mount()
    document.addEventListener('click', this.calcSelectedElements)
  }
  beforeDestroy() {
    document.removeEventListener('click', this.calcSelectedElements)
  }


  saveHeight(el: any) {
    this.infoHeight = getComputedStyle(el).height as any
    if (!this.infoHeight) this.infoHeight = 0
  }
  applyHeight(el: any) {
    const { height } = getComputedStyle(el)

    el.style.height = this.infoHeight

    setTimeout(() => {
      el.style.height = height
    })
  }
  applyHeightLeave(el: any) {
    el.style.height = this.infoHeight

    setTimeout(() => {
      el.style.height = 0
    })
  }
  setDefault(el: any) {
    el.style.height = 'auto'
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
  enter(obj: any) {
    let saveProject = true
    if (this.defaultProject && this.defaultProject.id === obj.projectId) saveProject = false
    this.updateTask({
      ...obj,
      id: this.task.id,
      saveProject,
    })
    this.editing = false
  }
  toggleTaskComplete() {
    this.done = true
    setTimeout(() => {
      this.done = false
    }, 1000)
    this.toggleCompleteTask({
      id: this.task.id,
      completed: !this.task.completed,
    })
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
  todayMomAndSavedMom(): {today: any, saved: any} {
    if (this.task.date)
      return appUtils.getMomentsOutOfTask(this.task.date, this.timeZone, this.task.time)
    return {today: null, saved: null}
  }

  get showDot1(): boolean {
    return !this.atLeastTwoInfoOptionsWontShowUp && (this.allTrue || this.showLabels)
  }
  get showDot2(): boolean {
    // tslint:disable-next-line:max-line-length
    return !this.atLeastTwoInfoOptionsWontShowUp && (this.allTrue || !this.showLabels || !(this.showLastEditDate || this.showCreationDate))
  }

  get options(): ListIcon[] {
    const options = [
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
    ]
    if (this.task.projectId)
      options.push({
        name: 'Remove task from project',
        icon: 'project-diagram',
        iconColor: '',
        size: 'lg',
        callback: () => {
          this.removeTasksFromProject([this.task.id])
        },
      })
    if (!this.task.projectId)
      options.push({
        name: 'Add to project',
        icon: 'project-diagram',
        iconColor: '',
        size: 'lg',
        callback: () => {
          this.pushPopUp('AddtoprojectPopup')
          this.pushPopUpPayload([this.task.id])
        },
      })
    options.push({
        name: 'Delete task',
        icon: 'trash',
        size: 'lg',
        iconColor: '',
        callback: () => {
          this.deleteTasksById([this.task.id])
        },
      })
    return options
  }
  get showTodayIcon(): boolean {
    if (this.fixedPers === 'Today' || !this.task.date) return false
    const {today, saved} = this.todayMomAndSavedMom()
    return today.isSame(saved, 'day')
  }
  get showOverdueIcon(): boolean {
    if (this.fixedPers === 'Overdue' || !this.task.date) return false
    const {today, saved} = this.todayMomAndSavedMom()
    return saved.isBefore(today, 'day') && !this.task.completed
  }
  get showTomorrowIcon(): boolean {
    if (this.fixedPers === 'Tomorrow' || !this.task.date) return false
    const {today, saved} = this.todayMomAndSavedMom()
    today.add(1, 'd')
    return today.isSame(saved, 'day')
  }
  get allTrue(): boolean {
    if (this.showLabels && this.showLastEditDate && this.showCreationDate) return true
    return false
  }
  get atLeastTwoInfoOptionsWontShowUp(): boolean {
    let numbersOfFalse = 0
    if (!this.showLabels) numbersOfFalse++
    if (!this.showLastEditDate) numbersOfFalse++
    if (!this.showCreationDate) numbersOfFalse++
    return numbersOfFalse > 1
  }
  get showLabels(): boolean {
    return this.taskLabels && this.taskLabels.length > 0 && (this.alwaysShowTaskLabels || this.onHover)
  }
  get showLastEditDate(): boolean {
    return this.alwaysShowLastEditDate || this.onHover
  }
  get showCreationDate(): boolean {
    return this.alwaysShowCreationDate || this.onHover
  }
  get readableTaskCreationDate(): string {
    const savedMom = moment.tz(this.task.creationDate, 'Y-M-D HH:mm', 'UTC')
    const todayMom = moment().tz('UTC')
    return savedMom.from(todayMom)
  }
  get readableTaskLastEditDate(): string {
    const savedMom = moment.tz(this.task.lastEditDate, 'Y-M-D HH:mm', 'UTC')
    const todayMom = moment().tz('UTC')
    return savedMom.from(todayMom)
  }
  get date(): string | null {
    if (!this.task.date) return null
    const {today, saved} = this.todayMomAndSavedMom()

    const tom = today.clone().add(1, 'd')
    if (today.isSame(saved, 'day') || tom.isSame(saved, 'day')) return null
    if (today.isSame(saved, 'month')) return saved.format('D, ddd')
    if (today.isSame(saved, 'year')) return saved.format('MMM D, ddd')
    else saved.format('LL, ddd')

    return null
  }
  get time(): string | null {
    if (!(this.task.date && this.task.time)) return null
    const {today, saved} = this.todayMomAndSavedMom()
    return ' at ' + appUtils.parseUtcTime(saved.format('HH:mm'), this.timeFormat)
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
  get getProject(): Project | null {
    if (!this.task.projectId) return null
    const project = this.getProjectById(this.task.projectId)
    if (project) return project
    return null
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
  opacity: .5;
}

.tiny {
  font-size: .75em;
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

.txt-tag {
  display: inline-block;
  font-size: .8em;
  padding: 4px;
}

.task.not-selected.light:hover {
  background-color: #f0f0f0;
}

.task.not-selected.dark:hover {
  background-color: #282828;
}

.sortable-selected.light .task {
  background-color: #83B7E2 !important;
}

.sortable-selected.dark .task {
  background-color: #3287cd !important;
}

.content-icon {
  margin: 0 6px;
}

.txt {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.info-fade-enter, .info-fade-leave-to {
  opacity: 0;
}

.info-fade-enter-active, .info-fade-leave-active {
  transition: opacity .3s, height .3s;
}

.info-fade-enter-to, .info-fade-leave {
  opacity: 1;
}

.done, .undone {
  transition: border .4s, background-color .4s;
}

.done .txt, .undone .txt {
  transition: .4s;
}

.undone {
  border: 0px #000 solid;
  background-color: none;
}

.done.dark {
  background-color: rgba(50, 135, 205, .2) !important;
}

.done.light {
  background-color: rgba(131, 183, 226, .2) !important;
}

.done.dark .txt {
  color: #808080;
}

.done.light .txt {
  color: #b3b3b3;
}

.done.dark .txt {
  color: #3287cd;
}

.done.dark .txt {
  color: #83B7E2;
}

</style>
