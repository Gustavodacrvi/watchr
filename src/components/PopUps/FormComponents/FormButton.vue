<template>
  <button v-if='!waitingResponse'
    class='margin button round-border'
    @click="$emit('click')"
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
  @Prop(Boolean) waitingResponse!: boolean
}

</script>

<style scoped src='@/assets/css/authPopUp.css'>
</style>
