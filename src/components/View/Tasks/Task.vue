<template>
  <div class="Task rb">
    <div class="cont">
      <div class="check">
        <Icon class="icon"
          icon="circle"
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
  }
}

</script>

<style scoped>

.Task {
  height: 35px;
  cursor: pointer;
  transition: background-color .3s;
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

</style>
