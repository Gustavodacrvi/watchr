<template>
  <span v-if='!click' class='icon-dropdown' @mouseenter='showing = true' @mouseleave='showing = false'>
    <!-- <icon :icon='handle'></icon> -->
    <transition name='fade'>
      <div v-show='showing' class='card round-border content' :class='theme' :style='`min-width: ${minwidth}`'>
        <slot></slot>
      </div>
    </transition>
  </span>
  <span v-else class='icon-dropdown' @click='showing = true' @mouseleave='showing = false'>
    <!-- <icon :icon='handle'></icon> -->
    <transition name='fade'>
      <div v-show='showing' class='card round-border content' :class='theme' :style='`min-width: ${minwidth}`'>
        <slot></slot>
      </div>
    </transition>
  </span>
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'
// import FontAwesomeIcon from '@/components/FontAwesomeIcon.vue'

@Component
export default class TheNavbar extends Vue {
  @Prop({required: true, type: String}) public readonly handle!: string
  @Prop({default: '250px', type: String}) public readonly minwidth!: string
  @Prop({default: false, type: Boolean}) public readonly click!: boolean

  @State('theme') public theme!: string

  public showing: boolean = false
}

</script>

<style scoped>

.icon-dropdown {
  position: relative;
}

.content {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 25;
}

</style>
