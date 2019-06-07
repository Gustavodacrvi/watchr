<template>
  <div class='input'>
    <div class='content-editable' contenteditable='true'></div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'

@Component
export default class SigninPopUp extends Vue {
  @Prop({default: '', type: String}) public readonly input!: string

  public value: string = this.input
}

</script>

