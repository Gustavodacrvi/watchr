<template>
  <span class='fontawesome-icon' @click='$emit("click")' :class='[{blink: blink,}, "hover-" + hoverColor, disabled ? "disabled" : "not-disabled"]'>
    <i v-if='!spin' :class='`fas fa-${icon} fa-${size}`' :style='`color: ${color} !important`'></i>
    <i v-else :class='`fas fa-${icon} fa-${size} fa-spin`' :style='`color: ${color} !important`'></i>
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
  @Prop({default: false, type: Boolean}) public readonly disabled!: boolean
}

</script>

<style scoped>

.fontawesome-icon .fas {
  color: #8C8C8C;
}

.fontawesome-icon.not-disabled .fas.main-color {
  color: #fc7d7d;
}

.fontawesome-icon .fas {
  transition: color .3s;
}

.fontawesome-icon.not-disabled:hover {
  cursor: pointer;
}

.fontawesome-icon.not-disabled.hover-main-color:hover .fas {
  color: #fc7d7d;
}

.fontawesome-icon.not-disabled.hover-red:hover .fas {
  color: #FC7C85;
}

.fontawesome-icon.not-disabled.hover-white:hover .fas {
  color: white;
}

.blink:active .fas {
  color: white;
}

.disabled {
  opacity: .5;
}

</style>
