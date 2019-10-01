<template>
  <div class="Task draggable" :class="{fade: completed, isSelected, hideTask: completed && !showCompleted}"
    @mouseenter="onHover = true"
    @mouseleave="onHover = false"
  >
    <transition name="edit-t" mode="out-in">
      <div v-if="!isEditing" key="notediting"
        class="cont-wrapper handle rb" 
        @click="click"
        @dblclick="dblclick"
      >
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
            <Icon v-if="isTomorrow" class="name-icon" icon="sun" color="var(--orange)"/>
            <Icon v-else-if="isToday" class="name-icon" icon="star" color="var(--yellow)"/>
            <Icon v-else-if="isOverdue" class="name-icon" icon="star" color="var(--red)"/>
            <span v-else-if="calendarStr" class="tag cb rb">{{ calendarStr }}</span>
            <span v-if="listStr" class="tag cb rb">{{ listStr }}</span>
            <span>{{ task.name }}</span>
            <template v-if="isDesktop">
              <Tag class="task-tag" v-for="t in taskTags" :key="t.name"
                icon="tag"
                :value="t.name"
                :disabled='true'
              />
            </template>
          </div>
          <div class="icon-drop-wrapper">
            <IconDrop v-if="showIconDrop" class="icon-drop"
              handle='settings-v'
              :options='options'
            />
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
import IconDropVue from '../../IconDrop.vue'
import TagVue from '../Tag.vue'
import EditVue from './Edit.vue'

import { mapState, mapGetters } from 'vuex'

import utilsTask from '@/utils/task'
import utils from '@/utils/index'

import mom from 'moment'

export default {
  props: ['task', 'isSelected', 'showCompleted', 'view'],
  components: {
    Icon: IconVue,
    IconDrop: IconDropVue,
    Edit: EditVue,
    Tag: TagVue,
  },
  data() {
    return {
      isEditing: false,
      onHover: false,
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
    addPriority(pri) {
      this.$store.dispatch('task/saveTask', {
        id: this.task.id,
        priority: pri,
      })
    },
    saveCalendarDate(date) {
      this.$store.dispatch('task/saveTasksById', {
        ids: [this.task.id],
        task: {calendar: date},
      })
    },
    saveDate(date) {
      this.$store.dispatch('task/saveTask', {
        id: this.task.id,
        calendar: {
          defer: null,
          due: null,

          type: 'specific',
          time: null,
          editDate: mom().format('Y-M-D'),

          specific: date,
          lastCompleteDate: null,
          periodic: null
        },
      })
    },
  },
  computed: {
    ...mapState({
      isOnControl: state => state.isOnControl,
      savedLists: state => state.list.lists,
      savedTags: state => state.tag.tags,
    }),
    ...mapGetters(['isDesktop']),
    completed() {
      return utilsTask.filterTasksByCompletion([this.task]).length === 1
    },
    taskTags() {
      const ts = this.savedTags
      const arr = []
      for (const id of this.task.tags) {
        const tag = ts.find(el => el.id === id)
        if (tag) arr.push(tag)
      }
      return arr
    },
    options() {
      const dispatch = this.$store.dispatch
      return [
        {
          name: 'Edit task',
          icon: 'pen',
          callback: () => this.isEditing = true
        },
        {
          name: 'Copy task',
          icon: 'copy',
          callback: () => dispatch('task/copyTask', this.task)
        },
        {
          name: 'Move to list',
          icon: 'tasks',
        },
        {
          type: 'optionsList',
          name: 'Priority',
          options: [
            {
              icon: 'priority',
              id: 'd',
              color: 'var(--gray)',
              callback: () => this.addPriority('')
            },
            {
              icon: 'priority',
              id: 'f',
              color: 'var(--green)',
              callback: () => this.addPriority('Low priority')
            },
            {
              icon: 'priority',
              id: 'j',
              color: 'var(--yellow)',
              callback: () => this.addPriority('Medium priority')
            },
            {
              icon: 'priority',
              id: 'l',
              color: 'var(--red)',
              callback: () => this.addPriority('High priority')
            },
          ],
        },
        {
          type: 'optionsList',
          name: 'Schedule',
          options: [
            {
              icon: 'star',
              id: 'd',
              callback: () => this.saveDate(mom().format('Y-M-D')),
            },
            {
              icon: 'sun',
              id: 'çljk',
              callback: () => this.saveDate(mom().add(1, 'day').format('Y-M-D')),
            },
            {
              icon: 'calendar',
              id: 'çljkasdf',
              callback: () => {return {calendar: true, callback: this.saveCalendarDate}},
            },
          ]
        },
        {
          name: 'Delete task',
          icon: 'trash',
          callback: () => dispatch('task/deleteTasks', [this.task.id])
        }
      ]
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
      if (this.view === 'Tomorrow' || this.view === 'Today') return false
      return utilsTask.filterTasksByView([this.task], 'Tomorrow').length === 1
    },
    showIconDrop() {
      if (this.isDesktop && this.onHover) return true
      else if (!this.isDesktop) return true
    },
    listStr() {
      if (!this.task.list) return null
      return this.savedLists.find(el => el.id === this.task.list).name
    },
    calendarStr() {
      if (!this.task.calendar) return null
      const str = utils.parseCalendarObjectToString(this.task.calendar)
      if (str === this.view) return null
      return str
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
  height: auto;
  user-select: none;
  transition: opacity .3s;
  position: relative;
  z-index: 1;
}

.Task:hover {
  z-index: 2;
}

.cont-wrapper {
  cursor: pointer;
  height: auto;
  padding: 2px;
  transition: height .3s, background-color .2s;
}

.hide-task {
  height: 0;
  transition: height 0;
}

.lessthan38 {
  height: 38px !important;
  transition: height .3s !important;
}

.subtasks {
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
  background-color: rgba(53, 73, 90, 0.6);
}

.check, .text, .options, .cont {
  height: 100%;
}

.cont, .text, .check-drop, .check {
  display: flex;
}

.check, .icon-drop-wrapper {
  justify-content: center;
  align-items: center;
}

.icon-drop {
  transform: translateY(18.5px);
}

.check {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 35px;
  height: 100%;
  opacity: .6;
}

.handle, .Task, .cont {
  outline: none;
}

.cont {
  position: relative;
}

.icon {
  transform: translateY(2px);
}

.text {
  align-items: center;
  flex-basis: 100%;
  margin-left: 35px;
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
  padding: 0;
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
  opacity: 0 !important;
  height: 0px !important;
  padding: 0 !important;
  transition: height .2s, opacity .2s, padding .2s !important;
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

.task-tag {
  margin-left: 6px;
  transform: scale(.8,.8);
}

.task-tag + .task-tag {
  margin-left: -8px;
}

</style>
