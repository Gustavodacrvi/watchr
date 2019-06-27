<template>
  <div :class='theme'>
    <div class='title'>
      <h2>Send reset password e-mail</h2>
    </div>
    <div class='content'>
      <input
        class='margin input txt round-border gray'
        placeholder='E-mail: '
        type='text'
        autocomplete='off'
        :class='emailClass'
        v-model.trim='email'
      >
      <button v-if='!waitingResponse'
        class='margin button round-border'
        @click='sendRequest'
      >Send reset password e-mail</button>
      <button v-else
        class='margin button round-border'
      >
        <ft-icon
          class='icon pointer txt'
          icon='sync'
          :style="{color: 'white'}"
          spin
        ></ft-icon>
      </button>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Mixins } from 'vue-property-decorator'
import { State, Mutation } from 'vuex-class'
import mixin from '@/mixins/authPopUp'

import firebase from 'firebase/app'
import { Alert } from '@/interfaces/app'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faSync } from '@fortawesome/free-solid-svg-icons'

library.add(faSync)

@Component
export default class ResetPasswordPopUp extends Mixins(mixin) {
  @State theme!: string
  @Mutation pushAlert!: (alert: Alert) => void
  @Mutation pushPopUp!: (compName: string) => void

  waitingResponse: boolean = false
  email: string | null = null
  MAXIMUM_NUMBER_OF_CHARACTERS: number = 75

  sendRequest() {
    const hasError = this.inputHasError(this.email, this.MAXIMUM_NUMBER_OF_CHARACTERS)

    if (!hasError && this.email) {
      this.waitingResponse = true
      firebase.auth().sendPasswordResetEmail(this.email).then(() => {
        this.pushAlert({
          name: 'E-mail sent to your e-mail address.',
          duration: 5,
          type: 'success',
        })
        this.pushPopUp('')
        this.waitingResponse = false
      }).catch((error: any) => {
        this.pushAlert({
          name: error.message,
          duration: 8,
          type: 'error',
        })
        this.waitingResponse = false
      })
    }
  }

  get emailClass(): any[] {
    return [
      this.theme,
      {wrong: this.inputHasError(this.email, this.MAXIMUM_NUMBER_OF_CHARACTERS)},
    ]
  }
}

</script>

<style scoped src='@/assets/css/authPopUp.css'>
</style>
