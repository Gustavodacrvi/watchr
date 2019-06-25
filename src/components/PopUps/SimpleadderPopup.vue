<template>
  <div class='simple-adder-popup' :class='theme'>
    <div class='title'>
      <h2>{{ popUpPayload.popUpTitle }}</h2>
    </div>
    <div class='content'>
      <input
        tabindex='1'
        class='margin input txt round-border gray' :placeholder='popUpPayload.inputPlaceholder'
        type='text'
        autocomplete='off'
        :class='inputClass'
        v-model.trim='input'>
      <button
        class='margin button round-border'
        @click='runCallback'
      >{{ popUpPayload.buttonName }}</button>
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
  @State theme!: SimpleAdder
  @State popUpPayload!: SimpleAdder

  input: string | null = null

  runCallback() {
    if (this.input && !this.inputHasError(this.input, this.popUpPayload.inputMaximumCharacters))
      this.popUpPayload.callback(this.input.trim())
  }

  get inputClass() {
    return [
      this.theme,
      {wrong: this.inputHasError(this.input, this.popUpPayload.inputMaximumCharacters)},
    ]
  }
}

</script>

<style scoped src='@/assets/css/authPopUp.css'>
</style>
