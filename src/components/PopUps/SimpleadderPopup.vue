<template>
  <div class='simple-adder-popup' :class='theme'>
    <div class='title'>
      <h2>{{ data.popUpTitle }}</h2>
    </div>
    <div class='content'>
      <input tabindex='1' class='margin input txt round-border gray' :placeholder='data.inputPlaceholder' type='text' autocomplete='off' :class='[theme, {wrong: inputHasError(input, data.inputMaximumCharacters)}]' v-model='input'>
      <button class='margin button round-border' @click='runCallback'>{{ data.buttonName }}</button>      
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Mixins } from 'vue-property-decorator'
import { State, Mutation } from 'vuex-class'
import Mixin from '@/mixins/authPopUp'

import { SimpleAdder } from '@/interfaces/app'

@Component
export default class SigninPopUp extends Mixins(Mixin) {
  @State('theme') public readonly theme!: SimpleAdder
  @State('popUpPayload') public readonly data!: SimpleAdder

  public input: string | null = null

  public runCallback(): void {
    if (this.input && !this.inputHasError(this.input, this.data.inputMaximumCharacters)) {
      this.data.callback(this.input.trim())
    }
  }
}

</script>

<style scoped src='@/assets/css/authPopUp.css'>
</style>
