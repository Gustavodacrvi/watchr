<template>
  <div
    class='subtask-wrapper round-border cancel-getidsfromelements'
    @mouseenter='onHover = true'
    @mouseleave='onHover = false'
    @dblclick='editing = true'
  >
    <transition name='fade' mode='out-in'>
      <div v-if='!editing'
        key='not-edit'
        class='subtask round-border'
        :class='[theme, {completed: task.completed}, {draghandle: allowDragAndDrop}]'
        v-longpress='longPress'
        @click='elClick'
      >
        <span class='circles' @click='completeSubTask'>
          <i v-if='!task.completed' key='notco' class='far circle icon txt fa-circle fa-sm' :class='theme'></i>
          <i v-else key='com' class='far circle icon txt fa-check-circle fa-sm' :class='theme'></i>
        </span>
        <span class='txt' :class='theme'>{{ task.name }}</span>
        <transition name='fade'>
          <i v-if='showTrashIcons' class='fas right fa-trash fa-sm icon txt' :class='theme' @click='deleteSubTask'></i>
        </transition>
      </div>
      <task-edit v-else key='editing'
        v-model='subtaskVal'
        :only-edit='true'
        @add='saveNewSubTaskName'
        @cancel='editing = false'
      />
    </transition>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { State, Getter, namespace } from 'vuex-class'

const taskVuex = namespace('task')

import SubTaskEdit from '@/components/AppViews/AppviewComponents/Tasks/AppviewSubtaskEdit.vue'

import { longClickDirective } from 'vue-long-click'

const longPress = longClickDirective({delay: 1500, interval: 5000})

Vue.directive('longpress', longPress)

@Component({
  components: {
    'task-edit': SubTaskEdit,
  },
})
export default class AppviewSubtask extends Vue {
  @State theme!: string
  @Getter isDesktop!: boolean

  @Prop(Object) task!: any

  @taskVuex.Action saveSubTask!: (obj: {name: string, taskId: string, completed: boolean, id: string}) => void
  @taskVuex.Action deleteSubTaskFromTask!: (obj: {taskId: string, id: string}) => void

  @Prop(Boolean) allowDrag!: boolean
  @Prop(Boolean) deselectAll!: boolean

  editing: boolean = false
  onHover: boolean = false
  clicked: boolean = false
  subtaskVal: string = ''
  justLongPressed = false

  created() {
    this.subtaskVal = this.task.name
  }

  longPress() {
    console.log('press')
    this.justLongPressed = true
    if (!this.allowDrag)
      this.select()
  }
  elClick() {
    console.log('click')
    if (this.allowDrag && !this.justLongPressed)
      this.select()
    this.justLongPressed = false
  }
  select() {
    this.clicked = !this.clicked
    const el: HTMLElement = this.$el as HTMLElement
    this.$emit('toggle', {
      el,
      select: this.clicked,
    })
  }
  saveNewSubTaskName(val: string) {
    this.saveSubTask({
      name: val,
      completed: this.task.completed,
      taskId: this.task.taskId,
      id: this.task.id,
    })
    this.editing = false
  }
  completeSubTask() {
    if (!this.task.completed)
      this.saveSubTask({
        name: this.task.name,
        completed: true,
        taskId: this.task.taskId,
        id: this.task.id,
      })
  }
  deleteSubTask() {
    this.deleteSubTaskFromTask({
      id: this.task.id,
      taskId: this.task.taskId,
    })
  }

  get showTrashIcons(): boolean {
    return !this.isDesktop || (this.isDesktop && this.onHover)
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

.completed {
  opacity: .4;
}

.right {
  position: absolute;
  right: 15px;
}

.circle {
  transition: color .3s;
}

.circles {
  margin: 0 8px;
  margin-left: 4px;
  font-size: 1.2em;
}

.subtask {
  position: relative;
  width: 100%;
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.subtask-wrapper {
  transition: background-color .3s;
}

.subtask-wrapper.light:hover {
  background-color: #f0f0f0;
}

.subtask-wrapper.dark:hover {
  background-color: #282828;
}

.sortable-selected.light {
  background-color: #83B7E2 !important;
}

.sortable-selected.dark {
  background-color: #3287cd !important;
}

</style>

