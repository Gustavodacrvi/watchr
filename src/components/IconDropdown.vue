<template>
  <span
    class='icon-dropdown'
    @mouseenter='showing = true'
    @mouseleave='showing = false'
    @click="$emit('click')"
    :class="{'color-on-hover': changeColorOnHover}"
  >
    <i :class='[`pointer handle icon txt fas fa-${handle} fa-${size}`, theme, {centralize: centralize}]'></i>
    <transition name='fade'>
      <div v-show='showing'
        class='card round-border content'
        :class="[theme, {'float-top': floatTop}]"
        :style='`min-width: ${minWidth}`'
      >
        <slot></slot>
      </div>
    </transition>
  </span>
</template>

<script lang='ts'>

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

@Component
export default class TheNavbar extends Vue {
  @State theme!: string

  @Prop({required: true, type: String}) handle!: string
  @Prop({default: 'lg', type: String}) size!: string
  @Prop({default: '250px', type: String}) minWidth!: string
  @Prop(Boolean) changeColorOnHover!: boolean
  @Prop(Boolean) centralize!: boolean
  @Prop(Boolean) floatTop!: boolean

  showing: boolean = false
}

</script>

<style scoped>

.icon-dropdown {
  position: relative;
  display: inline-block;
  width: 100%;
  height: 100%;
}

.centralize {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%); 
}

.icon-dropdown:hover .icon {
  color: #83B7E2 !important;
}

.content {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 25;
}

.float-top {
  right: 0;
  top: initial;
  bottom: 100%;
}

</style>
