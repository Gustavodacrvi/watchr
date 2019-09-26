<template>
  <div class="Task draggable" :class="{fade: done}">
    <div class="cont-wrapper rb">
      <div class="cont">
        <div class="check" @click="completeTask">
          <Icon v-if="!isCompleted" class="icon"
            icon="circle"
            :primaryHover="true"
          />
          <Icon v-else class="icon"
            icon="circle-check"
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
  </div>
</template>

<script>

import IconVue from '../../Icon.vue'

export default {
  props: ['task'],
  components: {
    Icon: IconVue,
  },
  data() {
    return {
      done: false,
    }
  },
  methods: {
    completeTask() {
      this.done = !this.done
    },
  },
  computed: {
    isCompleted() {
      return this.done
    }
  }
}

</script>

<style scoped>

.Task {
  position: relative;
  height: auto;
  cursor: pointer;
  transition: opacity .3s;
}

.cont-wrapper {
  height: 40px;
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

.draggable--over .cont {
  display: none;
}

.draggable--over .cont-wrapper {
  background-color: var(--void) !important;
  transition-duration: 0 !important;
  transition: none !important;
}

</style>
