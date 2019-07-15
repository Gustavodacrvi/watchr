<template>
  <div class='division'>
    <div class='header'>
      <span class='txt'>{{ name }}</span>
      <span class='right' @click='showing = !showing'>
        <i class='fas pointer icon fa-angle-down fa-lg txt' :class='{rotate: showing}'></i>
      </span>
    </div>
    <transition name='fade'>
      <slot v-if='showing'></slot>
    </transition>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'

@Component
export default class TodayView extends Vue {
  @Prop(String) name!: string

  showing: boolean = true
}

</script>

<style scoped>

.header {
  height: 20px;
  display: flex;
  align-items: center;
  opacity: .6;
  margin-left: -12px;
  font-size: .8em;
  margin: 10px 0;
  position: relative;
}

.fas {
  transition: transform .3s;
}

.rotate {
  transform: rotate(-90deg);
}

.right {
  position: absolute;
  right: 0;
}

</style>
