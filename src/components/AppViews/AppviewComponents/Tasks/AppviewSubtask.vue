<template>
  <div class='subtask round-border' :class='theme'>
    <span class='circles'>
      <i v-if='!task.completed' key='notco' class='far circle icon txt fa-circle fa-sm' :class='theme'></i>
      <i v-else key='com' class='far circle icon txt fa-check-circle fa-sm' :class='theme'></i>
    </span>
    <span class='txt' :class='theme'>{{ task.name }}</span>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'

@Component
export default class AppviewSubtask extends Vue {
  @State theme!: string

  @Prop(Object) task!: any
}

</script>

<style scoped>

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
  padding: 4px;
  cursor: pointer;
}

.subtask.light:hover {
  background-color: #f0f0f0;
}

.subtask.dark:hover {
  background-color: #282828;
}

</style>

