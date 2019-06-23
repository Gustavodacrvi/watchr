<template>
  <span class='fontawesome-icon' @click='$emit("click")' :class='disabled ? "disabled" : "not-disabled"'>
    <i :class='`fas fa-${icon} fa-${size} ${spin ? "fa-spin" : ""}`' :style='`color: ${color} !important`'></i>
  </span>
</template>

<script lang="ts">

import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class App extends Vue {
  @Prop({type: String, required: true}) public readonly icon!: string
  @Prop({default: 'lg', type: String}) public readonly size!: string
  @Prop({default: '', type: String}) public readonly color!: string
  @Prop(Boolean) public readonly spin!: boolean
  @Prop({default: false, type: Boolean}) public readonly disabled!: boolean
}

</script>

<style scoped src='@/assets/css/fontAwesomeIcon.css'>
</style>
