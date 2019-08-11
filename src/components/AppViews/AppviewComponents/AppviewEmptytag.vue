<template>
  <span class='tag-wrapper border-card' @click="$emit('click', name)" :class='theme'>
    <span class='txt name fade' :class='theme'>{{ getName }}</span>
  </span>
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'

@Component
export default class AppviewEmptytag extends Vue {
  @State theme!: string

  @Prop(String) name!: string

  get getName(): string {
    switch (this.name) {
      case 'name': return 'Sort by name'
      case 'priorityHighest': return 'Sort tasks by priority highest first'
      case 'priorityLowest': return 'Sort tasks by priority lowest first'
      case 'creationDateNewest': return 'Sort by creation date newest first'
      case 'creationDateOldest': return 'Sort by creation date oldest first'
    }
    return ''
  }
}

</script>

<style scoped>

.tag-wrapper {
  border-radius: 100px;
  padding: 4px 12px;
  display: inline-block;
  cursor: pointer;
  transition: background-color .2s;
}

.tag-wrapper + .tag-wrapper {
  margin-left: 6px;
}

.tag-wrapper.dark:hover {
  background-color: #282828;
}

.tag-wrapper.light:hover {
  background-color: #e3e3e3;
}

</style>
