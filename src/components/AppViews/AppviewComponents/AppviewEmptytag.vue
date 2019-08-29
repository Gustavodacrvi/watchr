<template>
  <span class='tag-wrapper border-card' @click="$emit('click', name)" :class='theme'>
    <span class='txt name fade' :class='theme'>{{ getName }}</span>
  </span>
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'
import { IndexState } from '../../../interfaces/store/index'

@Component
export default class AppviewEmptytag extends Vue {
  @State theme!: IndexState.theme

  @Prop(String) name!: string

  get getName(): string {
    switch (this.name) {
      case 'name': return 'Sort by name'
      case 'nameReversed': return 'Sort tasks by name reversed'
      case 'priorityHighest': return 'Sort tasks by priority(high to low)'
      case 'priorityLowest': return 'Sort tasks by priority(low to high)'
      case 'creationDateNewest': return 'Sort by creation(new to old)'
      case 'creationDateOldest': return 'Sort by creation(old to new)'
      case 'lastEditDateOldest': return 'Sort by last edit date(old to new)'
      case 'lastEditDateNewest': return 'Sort by last edit date(new to old)'
      case 'dateOldest': return 'Sort by date(old to new)'
      case 'dateNewest': return 'Sort by date(new to old)'
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
