<template>
  <span class='fontawesome-icon' @click='$emit("click")' :class='[{blink: blink,}, disabled ? "disabled" : "not-disabled", expand ? "expand" : ""]'>
    <span class='wrapper'>
      <i v-if='!spin' :class='`fas fa-${icon} fa-${size}`' :style='`color: ${color} !important`'></i>
      <i v-else :class='`fas fa-${icon} fa-${size} fa-spin`' :style='`color: ${color} !important`'></i>
    </span>
  </span>
</template>

<script lang="ts">

import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class App extends Vue {
  @Prop({default: 'lg', type: String}) public readonly size!: string
  @Prop({default: '', type: String}) public readonly color!: string
  @Prop(Boolean) public readonly blink!: boolean
  @Prop(Boolean) public readonly spin!: boolean
  @Prop({default: false, type: Boolean}) public readonly expand!: boolean
  @Prop(String) public readonly icon!: string
  @Prop({default: false, type: Boolean}) public readonly disabled!: boolean
}

</script>

<style scoped src='@/assets/css/fontAwesomeIcon.css'>
</style>
