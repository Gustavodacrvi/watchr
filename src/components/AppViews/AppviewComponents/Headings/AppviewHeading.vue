<template>
  <div class='heading-wrapper'>
    <div class='header' :class='theme' @click='showing = !showing'>
      <span class='txt' :class='theme'>{{ obj.name }}</span>
      <span v-if='obj.faded' class='txt faded' :class='theme'>{{ obj.faded }}</span>
    </div>
    <transition name='fade'>
      <div v-if='showing' class='content'>
        <slot></slot>
      </div>
    </transition>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'
import { IndexState } from '../../../../interfaces/store/index'

@Component
export default class AppviewHeading extends Vue {
  @State theme!: IndexState.theme

  @Prop(Object) obj!: {name: string, faded?: string}

  showing: boolean = true
}

</script>

<style scoped>

.header {
  font-size: 1.5em;
  height: 40px;
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  cursor: pointer;
  position: relative;
}

.header.dark {
  border-bottom: 1px solid #292929;
}

.header.light {
  border-bottom: 1px solid #dbdbdb;
}

.heading-wrapper + .heading-wrapper {
  margin-top: 45px;
}

.faded {
  margin-left: 10px;
  font-size: .8em;
  opacity: .6;
}

</style>
