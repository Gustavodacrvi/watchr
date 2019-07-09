<template>
  <div class='task round-border' :class='theme'>
    <div class='content'>
      <span class='txt'>{{ task.name }}</span>
      <dynamic-ft-icon v-if='task.priority'
        class='content-icon'
        icon='exclamation'
        size='sm'
        :style='{color: exclamationColor}'
      />
    </div>
    <div class='options'>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'

import FontAwesome from '@/components/DynamicFontawesome.vue'

import { Task } from '../../../interfaces/app'

@Component({
  components: {
    'dynamic-ft-icon': FontAwesome,
  },
})
export default class AppviewTask extends Vue {
  @State theme!: string
  
  @Prop(Object) task!: Task

  get exclamationColor() {
    switch (this.task.priority) {
      case 'Low priority': return '#70ff66'
      case 'Medium priority': return '#fff566'
      case 'High priority': return '#FF6B66'
    }
  }
}

</script>

<style scoped>

.task {
  display: flex;
  transition: background-color .3s;
  cursor: pointer;
  height: 40px;
}

.content {
  flex-basis: 100%;
  margin-left: 6px;
  display: flex;
  align-items: center;
}

.task.light:hover {
  background-color: #e3e3e3;
}

.task.dark:hover {
  background-color: #282828;
}

.content-icon {
  margin: 0 6px;
}

</style>
