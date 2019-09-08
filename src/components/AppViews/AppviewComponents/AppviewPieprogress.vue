<template>
  <div class="pie-wrapper" :class="theme" :style='outlineStyle'>
    <svg class='svg' viewBox="0 0 32 32" :width='getsvgWidth'>
      <circle class='pie' :class="theme" :stroke-dasharray="`${progress} 100`"></circle>
    </svg>
    <div class="outline" :style='outlineStyle' :class="theme"></div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { IndexState } from '../../../interfaces/store'

@Component
export default class AppviewPie extends Vue {
  @State theme!: IndexState.theme

  @Prop(Number) svgWidth!: string
  @Prop(Number) progress!: string

  get getsvgWidth(): string {
    return '' + this.svgWidth + 'px'
  }
  get outlineStyle(): object {
    const width = '' + (this.svgWidth + 7) + 'px'
    return {
      width,
      height: width,
    }
  }
}

</script>

<style scoped>

.svg {
  left: 0;
  top: 0;
  border-radius: 50%;
  transform: rotate(-90deg);
  position: absolute;
}

.pie-wrapper {
  position: relative;
  display: inline-block;
}

.pie {
  fill: none;
  transition-duration: .7s;
  stroke-width: 32;
  r: 16;
  cx: 16;
  cy: 16;
}

.dark {
  stroke: #b3b3b3;
}

.light {
  stroke: #808080;
}

.outline {
  position: absolute;
  left: -4px;
  top: -4px;
  border-radius: 100px;
}

.outline.dark {
  border: .5px #b3b3b3 solid;
}

.outline.light {
  border: .5px #808080 solid;
}

</style>
