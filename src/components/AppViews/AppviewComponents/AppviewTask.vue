<template>
  <div class='task round-border' :class='theme'>
    <div class='content' @click='toggleElement'>
      <span class='txt'>{{ task.name }}</span>
      <i v-if='task.priority'
        class='content-icon fas fa-exclamation fa-sm'
        :style='{color: exclamationColor}'
      ></i>
    </div>
    <div class='options'>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { Task } from '../../../interfaces/app'

@Component
export default class AppviewTask extends Vue {
  @Prop(Object) task!: Task
  @Prop(Boolean) deselectAll!: boolean

  @State theme!: string

  clicked: boolean = false

  toggleElement() {
    this.clicked = !this.clicked
    const el: HTMLElement = this.$el as HTMLElement
    this.$emit('toggle', {
      el,
      select: this.clicked,
    })
  }

  get exclamationColor() {
    switch (this.task.priority) {
      case 'Low priority': return '#70ff66'
      case 'Medium priority': return '#fff566'
      case 'High priority': return '#FF6B66'
    }
  }

  @Watch('deselectAll')
  onChange() {
    this.clicked = false
  }
}

</script>

<style scoped>

.task {
  display: flex;
  transition: background-color .3s;
  cursor: pointer;
  min-height: 40px;
}

.content {
  flex-basis: 100%;
  margin: 6px 0;
  margin-left: 6px;
  display: flex;
  align-items: center;
}

.sortable-selected.light {
  background-color: #ffbfbd !important;
}

.sortable-selected.dark {
  background-color: #3B2B2A !important;
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
