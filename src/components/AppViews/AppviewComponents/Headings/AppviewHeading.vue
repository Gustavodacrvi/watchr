<template>
  <div class='heading-wrapper'>
    <div class='header' :class='theme' @click='showing = !showing'>
      <span class='txt' :class='theme'>{{name}}</span>
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

@Component
export default class AppviewHeading extends Vue {
  @State theme!: string
  
  @Prop(String) name!: string
  
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

</style>
