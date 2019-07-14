<template>
  <button v-if='!waitingResponse'
    class='margin button round-border'
    :class='{block: blockButton}'
    @click="click"
  ><slot></slot></button>
  <button v-else
    class='margin button round-border'
  >
    <i class='icon pointer txt fas fa-sync fa-spin' :style="{color: 'white'}"></i>
  </button>
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'

@Component
export default class FormButtom extends Vue {
  @Prop({default: false, type: Boolean}) waitingResponse!: boolean
  @Prop({default: false, type: Boolean}) blockButton!: boolean

  click() {
    if (!this.blockButton)
      this.$emit('click')
  }
}

</script>

<style scoped src='@/assets/css/authPopUp.css'>
</style>
