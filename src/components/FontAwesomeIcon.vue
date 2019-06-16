<template>
  <span class='fontawesome-icon' @click='$emit("click")' :class='[{blink: blink,}, "hover-" + hoverColor]'>
    <i v-if='!spin' :class='`fas fa-${icon} fa-${size} ${color}`'></i>
    <i v-else :class='`fas fa-${icon} fa-${size} fa-spin ${color}`'></i>
  </span>
</template>

<script lang="ts">

import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class App extends Vue {
  @Prop({default: 'lg', type: String}) public readonly size!: string
  @Prop({default: 'main-color', type: String}) public readonly hoverColor!: string
  @Prop({default: '', type: String}) public readonly color!: string
  @Prop(Boolean) public readonly blink!: boolean
  @Prop(Boolean) public readonly spin!: boolean
  @Prop(String) public readonly icon!: string
}

</script>

<style scoped>

.fontawesome-icon .fas {
  color: #8C8C8C;
}

.fontawesome-icon .fas.main-color {
  color: #AF92F7;
}

.fontawesome-icon .fas {
  transition: color .3s;
}

.fontawesome-icon:hover {
  cursor: pointer;
}

.fontawesome-icon.hover-main-color:hover .fas {
  color: #AF92F7;
}

.fontawesome-icon.hover-red:hover .fas {
  color: #FC7C85;
}

.fontawesome-icon.hover-white:hover .fas {
  color: white;
}

.blink:active .fas {
  color: white;
}

</style>
