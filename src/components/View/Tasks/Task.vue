<template>
  <div class="Task draggable" :class="{fade: done, isSelected}">
    <transition name="edit-t" mode="out-in">
      <div v-if="!isEditing" key="notediting" class="cont-wrapper handle rb" @click="click" @dblclick="dblclick">
        <div class="cont">
          <div class="check" @click="completeTask">
            <Icon v-if="!isCompleted" class="icon"
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
            {{ task.name }}
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

export default {
  props: ['task', 'isSelected'],
  components: {
    Icon: IconVue,
    Edit: EditVue,
  },
  data() {
    return {
      done: false,
      isEditing: false,
    }
  },
  methods: {
    completeTask() {
      this.done = !this.done
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
    isCompleted() {
      return this.done
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
  transform: translateY(2px);
}

.text {
  align-items: center;
  flex-basis: 100%;
}

.check-drop {
  flex-basis: 28px;
}

.draggable-mirror {
  background-color: var(--light-gray);
  border-radius: 6px;
}

.draggable--over .cont {
  display: none;
}

.draggable--over .cont-wrapper {
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

</style>
