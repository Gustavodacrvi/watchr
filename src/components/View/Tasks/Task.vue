<template>
  <div class="Task draggable" :class="{fade: completed, isSelected, hideTask: completed && !showCompleted}">
    <transition name="edit-t" mode="out-in">
      <div v-if="!isEditing" key="notediting" class="cont-wrapper handle rb" @click="click" @dblclick="dblclick">
        <div class="cont">
          <div class="check" @click.stop="completeTask">
            <Icon v-if="!completed" class="icon"
              icon="circle"
              :color='circleColor'
              :primaryHover="true"
            />
            <Icon v-else class="icon"
              icon="circle-check"
              :color='circleColor'
              :primaryHover="true"
            />
          </div>
          <div class="text">
            <Icon v-if="isTomorrow" class="name-icon" icon="star" color="var(--orange)"/>
            <Icon v-else-if="isToday" class="name-icon" icon="star" color="var(--yellow)"/>
            <Icon v-else-if="isOverdue" class="name-icon" icon="star" color="var(--red)"/>
            <span v-else-if="calendarStr" class="tag cb rb">{{ calendarStr }}</span>
            <span>{{ task.name }}</span>
          </div>
          <div class="icon-drop">
          </div>
        </div>
      </div>
      <Edit v-else key="editing" class="handle"
        placeholder="Task name..."
        btnText="Save task"
        :task='task'
        :showCancel='true'
        @cancel='isEditing = false'
        @save='saveTask'
      />
    </transition>
  </div>
</template>

<script>

import IconVue from '../../Icon.vue'
import EditVue from './Edit.vue'

import { mapState, mapGetters } from 'vuex'

import utilsTask from '@/utils/task'
import utils from '@/utils/index'

import mom from 'moment'

export default {
  props: ['task', 'isSelected', 'showCompleted', 'view'],
  components: {
    Icon: IconVue,
    Edit: EditVue,
  },
  data() {
    return {
      isEditing: false,
    }
  },
  methods: {
    completeTask() {
      const calendar = this.task.calendar
      if (calendar) {
        const {nextEventAfterCompletion} = utilsTask.taskData(this.task, mom())
        calendar.lastCompleteDate = nextEventAfterCompletion.format('Y-M-D')
      }
      this.$store.dispatch('task/completeTasks', {
        calendar,
        ids: [this.task.id],
      })
    },
    selectTask() {
      this.$emit('select', this.task.id)
    },
    click() {
      if (this.isDesktop && this.isOnControl) {
        this.selectTask()
      } else if (this.isDesktop) {
        this.isEditing = true
      } else if (!this.isSelecting) {
        this.selectTask()
      }
    },
    dblclick() {
      if (!this.isDesktop)
        this.isEditing = true
    },
    saveTask(obj) {
      this.$store.dispatch('task/saveTask', {
        id: this.task.id,
        ...obj,
      })
      this.isEditing = false
    },
  },
  computed: {
    ...mapState(['isOnControl']),
    ...mapGetters(['isDesktop']),
    completed() {
      return utilsTask.filterTasksByCompletion([this.task]).length === 1
    },
    isOverdue() {
      if (this.view === 'Overdue') return false
      return false
    },
    isToday() {
      if (this.view === 'Today') return false
      return utilsTask.filterTasksByView([this.task], 'Today').length === 1
    },
    isTomorrow() {
      if (this.view === 'Tomorrow') return false
      return utilsTask.filterTasksByView([this.task], 'Tomorrow').length === 1
    },
    calendarStr() {
      if (!this.task.calendar) return null
      return utils.parseCalendarObjectToString(this.task.calendar)
    },
    circleColor() {
      if (!this.task.priority) return ''
      const obj = {
        'Low priority': 'var(--green)',
        'Medium priority': 'var(--yellow)',
        'High priority': 'var(--red)',
      }
      return obj[this.task.priority]
    },
  }
}

</script>

<style scoped>

.Task {
  position: relative;
  height: auto;
  user-select: none;
  transition: opacity .3s;
}

.cont-wrapper {
  cursor: pointer;
  height: 38px;
  transition: height .3s, background-color .2s;
}

.task-hided {
  height: 0;
}

.subtasks {
  position: relative;
  top: 100%;
  left: 0;
}

.fade {
  opacity: .4;
}


.cont-wrapper:hover {
  background-color: var(--light-gray);
}

.isSelected .cont-wrapper {
  background-color: rgba(89, 160, 222, .6);
}

.cont {
  height: 100%;
}

.check, .text, .options {
  height: 100%;
}

.cont, .text, .check-drop, .check {
  display: flex;
}

.check, .icon-drop {
  justify-content: center;
  align-items: center;
}

.check {
  flex-basis: 35px;
  opacity: .6;
}

.handle, .Task, .cont {
  outline: none;
}

.icon {
  transform: translateY(1px);
}

.text {
  align-items: center;
  flex-basis: 100%;
}

.check-drop {
  flex-basis: 28px;
}

.sortable-drag {
  background-color: var(--light-gray);
  border-radius: 6px;
}

.sortable-ghost .cont {
  display: none;
}

.sortable-ghost .cont-wrapper {
  background-color: var(--void) !important;
  transition-duration: 0 !important;
  transition: none !important;
}

.edit-t-enter, .edit-t-leave-to {
  opacity: 0;
  transform: scale(.95,.95);
  transition: opacity .1s ease-out, transform .1s ease-out;
}

.edit-t-leave, .edit-t-enter-to {
  opacity: 1;
  transform: scale(1,1);
  transition: opacity .1s ease-in, transform .1s ease-in;
}

.hideTask .cont-wrapper {
  opacity: 0;
  height: 0px;
  transition: height .2s, opacity .2s;;
}

.name-icon {
  margin: 0 4px;
}

.tag {
  display: inline-block;
  padding: 5px;
  margin: 0 4px;
  font-size: .75em;
}

</style>
