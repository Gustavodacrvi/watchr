<template>
  <div>
    <div class='margin'></div>
    <div class='header'>
      <span class='name txt'>{{ name }}</span>
      <ft-icon class='icon txt pointer' :class='{showing: showing}' icon='angle-right' size='1x' @click='showing = !showing'></ft-icon>
    </div>
    <div class='margin'></div>
    <transition name='fade'>
      <div v-if='showing' class='content'>
        <slot></slot>
      </div>
    </transition>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faAngleRight } from '@fortawesome/free-solid-svg-icons'

library.add(faAngleRight)

@Component
export default class AppnavDivision extends Vue {
  @Prop({type: String, required: true}) name!: string

  showing: boolean = true
}

</script>

<style scoped>

.margin {
  height: 12px;
}

.icon {
  transition: transform .3s;
}

.icon.showing {
  transform: rotate(90deg);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header .name {
  margin-left: -5px;
  font-size: .8em;
}

</style>
