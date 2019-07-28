<template>
  <div class='subtask-wrapper' @mouseenter='onHover = true' @mouseleave='onHover = false'>
    <transition name='fade' mode='out-in'>
      <div v-if='!editing' key='not-edit' class='subtask round-border' :class='[theme, {completed: task.completed}]' @dblclick='editing = true'>
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

import { Component, Vue, Prop } from 'vue-property-decorator'
import { State, Getter, namespace } from 'vuex-class'

const taskVuex = namespace('task')

import SubTaskEdit from '@/components/AppViews/AppviewComponents/Tasks/AppviewSubtaskEdit.vue'

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

  editing: boolean = false
  onHover: boolean = false
  subtaskVal: string = ''

  created() {
    this.subtaskVal = this.task.name
  }

  saveNewSubTaskName() {
    this.saveSubTask({
      name: this.subtaskVal,
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
}

</script>

<style scoped>

.completed {
  opacity: .4;
}

.right {
  position: absolute;
  right: 5px;
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
  transition: background-color .3s;
}

.subtask.light:hover {
  background-color: #f0f0f0;
}

.subtask.dark:hover {
  background-color: #282828;
}

</style>

