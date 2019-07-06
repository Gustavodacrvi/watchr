<template>
  <span
    class='icon-dropdown'
    @mouseenter='showing = true'
    @mouseleave='showing = false'
    :class="{'color-on-hover': changeColorOnHover}"
  >
    <ft-icon
      class='pointer handle icon txt'
      :icon='handle'
      :size='size'
    ></ft-icon>
    <transition name='fade'>
      <div v-show='showing'
        class='card round-border content'
        :class='theme'
        :style='`min-width: ${minWidth}`'
      >
        <slot></slot>
      </div>
    </transition>
  </span>
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'

@Component
export default class TheNavbar extends Vue {
  @Prop({required: true, type: String}) handle!: string
  @Prop({default: 'lg', type: String}) size!: string
  @Prop({default: '250px', type: String}) minWidth!: string
  @Prop({default: false, type: Boolean}) changeColorOnHover!: boolean

  @State theme!: string

  public showing: boolean = false
}

</script>

<style scoped>

.icon-dropdown {
  position: relative;
  display: inline-block;
  width: 100%;
  height: 100%;
  z-index: 25;
}

.icon-dropdown:hover .icon {
  color: #fc7d7d !important;
}

.content {
  position: absolute;
  top: 100%;
  right: 0;
}

</style>
