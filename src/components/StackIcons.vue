<template>
  <span :class='[`fontawesome-icon txt fa-stack fa-${size} ${spin ? "fa-spin" : ""}`, disabled ? "disabled" : "not-disabled"]'>
    <i v-for='i in icons' :key='i.icon' :class='`fas fa-${i.icon} fa-stack-${i.size}`' :style='`color: ${i.iconColor} !important`'></i>
  </span>
</template>

<script lang='ts'>

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'

interface Icon {
  icon: string
  iconColor: string
  size: string
}

@Component
export default class StackIcons extends Vue {
  @Prop({type: Array, required: true}) public readonly icons!: Icon[]
  @Prop({default: 'lg', type: String}) public readonly size!: string
  @Prop({default: '', type: String}) public readonly color!: string
  @Prop(Boolean) public readonly spin!: boolean
  @Prop({default: false, type: Boolean}) public readonly disabled!: boolean
}

</script>

<style scoped src='@/assets/css/fontAwesomeIcon.css'>
</style>
