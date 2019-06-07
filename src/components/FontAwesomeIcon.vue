<template>
  <span class='fontawesome-icon' @click='$emit("click")' :class='[{blink: blink,}, hoverColor]'>
    <span v-if='!stack' class='txt'>
      <i v-if='!spin' :class='`fas fa-${icon} fa-${size}`'></i>
      <i v-else :class='`fas fa-${icon} fa-${size} fa-spin`'></i>
    </span>
    <span v-else :class='`fa-stack txt`'>
      <template v-for='i in stack'>
        <i v-if='!i.color' :key='i.icon' :class='`fas fa-${i.icon} fa-stack-${i.size}`'></i>
        <i v-else :key='i.icon' :class='`fas fa-${i.icon} fa-stack-${i.size}`' :style='`color: ${i.color}`'></i>
      </template>
    </span>
  </span>
</template>

<script lang="ts">

import { Vue, Component, Prop } from 'vue-property-decorator'

interface Stack {
  color: string
  icon: string
  size: string
}

@Component
export default class App extends Vue {
  @Prop({default: 'lg', type: String}) public readonly size!: string
  @Prop({default: 'main-color', type: String}) public readonly hoverColor!: string
  @Prop(Boolean) public readonly blink!: boolean
  @Prop(Boolean) public readonly spin!: boolean
  @Prop(String) public readonly icon!: string
  @Prop(Array) public readonly stack!: Stack[]
}

</script>

<style scoped>

.fontawesome-icon .fas {
  transition: color .3s;
}

.fontawesome-icon:hover {
  cursor: pointer;
}

.fontawesome-icon.main-color:hover .fas {
  color: #A97CFC;
  text-shadow: 0 0 1px #A97CFC;
}

.fontawesome-icon.red:hover .fas {
  color: #FC7C85;
  text-shadow: 0 0 1px #FC7C85;
}

.blink:active .fas {
  color: white;
}

</style>
