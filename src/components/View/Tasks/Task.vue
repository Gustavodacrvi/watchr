<template>
  <div class="Task draggable rb" :class="{fade: done}">
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
  height: 40px;
  opacity: 1;
  cursor: pointer;
  transition: height .3s, opacity .3s;
}

.fade {
  opacity: .4;
}

.Task:hover {
  background-color: var(--light-gray);
}

.cont, .check, .text, .options {
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

.draggable--over {
  background-color: var(--void) !important;
  transition-duration: 0 !important;
  transition: none !important;
}

</style>
