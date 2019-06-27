<template>
  <button v-if='!waitingResponse'
    class='margin button round-border'
    @click="$emit('click')"
  ><slot></slot></button>
  <button v-else
    class='margin button round-border'
  >
    <ft-icon
      class='icon pointer txt'
      icon='sync'
      :style="{color: 'white'}"
      spin
    />
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
