<template>
  <div class='heading-wrapper'>
    <div class='header'></div>
    <transition name='fade'>
      <div v-if='showing' class='content'>
        <slot></slot>
      </div>
    </transition>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'

@Component
export default class AppviewHeading extends Vue {
  showing: boolean = true
}

</script>

<style scoped>

</style>
