<template>
  <div class='division'>
    <div class='header'>
      <span class='txt' :class='theme'>{{ name }}</span>
      <span class='right' @click='showing = !showing'>
        <span v-for='i in icons'
          :key='i.name'
          class='header-option'
          @click.stop='i.callback'
        >
          <i :class='[`fas pointer icon fa-${i.icon} fa-${i.size} txt`, theme]'></i>
        </span>
        <span class='header-option'>
          <i class='fas pointer icon fa-angle-down fa-lg txt' :class='[{rotate: showing}, theme]'></i>
        </span>
      </span>
    </div>
    <transition name='fade'>
      <slot v-if='showing'></slot>
    </transition>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { ListIcon } from '../../../interfaces/app'
import { IndexState } from '../../../interfaces/store/index'

@Component
export default class TodayView extends Vue {
  @State theme!: IndexState.theme

  @Prop(String) name!: string
  @Prop(Array) icons!: ListIcon[]

  showing: boolean = true
}

</script>

<style scoped>

.header-option {
  margin-right: 8px;
}

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
