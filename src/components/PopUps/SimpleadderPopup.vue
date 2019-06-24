<template>
  <div class='simple-adder-popup' :class='theme'>
    <div class='title'>
      <h2>{{ data.popUpTitle }}</h2>
    </div>
    <div class='content'>
      <input
        tabindex='1'
        class='margin input txt round-border gray' :placeholder='data.inputPlaceholder'
        type='text'
        autocomplete='off'
        :class='inputClass'
        v-model='input'>
      <button
        class='margin button round-border'
        @click='runCallback'
      >{{ data.buttonName }}</button>
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
  @State data!: SimpleAdder

  input: string | null = null

  runCallback() {
    if (this.input && !this.inputHasError(this.input, this.data.inputMaximumCharacters))
      this.data.callback(this.input.trim())
  }

  get inputClass() {
    return [
      this.theme,
      {wrong: this.inputHasError(this.input, this.data.inputMaximumCharacters)},
    ]
  }
}

</script>

<style scoped src='@/assets/css/authPopUp.css'>
</style>
