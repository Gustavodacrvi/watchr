<template>
  <div :class='theme'>
    <div class='title'>
      <h2>Reset password</h2>
    </div>
    <div class='content'>
      <div class='margin password'>
        <input
          class='input txt round-border gray'
          placeholder='New password: '
          :type='passwordType'
          autocomplete='off'
          :class='newPasswordClass'
          v-model.trim='newPassword'
        >
        <span class='eyes'>
          <transition
            name='fade'
            mode='out-in'
          >
            <ft-icon v-if="passwordType === 'text'"
              key='eye'
              class='eye txt icon pointer'
              icon='eye'
              size='1x'
              @click='togglePassword'
            ></ft-icon>
            <ft-icon v-else
              key='eye-slash'
              class='eye txt icon pointer'
              icon='eye-slash'
              size='1x'
              @click='togglePassword'
            ></ft-icon>
          </transition>
        </span>
      </div>
      <div class='margin password'>
        <input
          class='input txt round-border gray'
          placeholder='Confirm password: '
          :type='passwordType'
          autocomplete='off'
          :class='confirmPasswordClass' v-model.trim='confirmPassword'>
        <span class='eyes'>
          <transition
            name='fade'
            mode='out-in'
          >
            <ft-icon v-if="passwordType === 'text'"
              key='eye'
              class='eye txt icon pointer'
              icon='eye' size='1x'
              @click='togglePassword'
            ></ft-icon>
            <ft-icon v-else
              key='eye-slash'
              class='eye txt icon pointer'
              icon='eye-slash'
              size='1x'
              @click='togglePassword'
            ></ft-icon>
          </transition>
        </span>
      </div>
      <button v-if='!waitingResponse'
        class='margin button round-border'
        @click='sendRequest'
      >Sign up</button>
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
  @State popUpPayload!: string
  @Mutation pushAlert!: (alert: Alert) => void
  @Mutation pushPopUp!: (compName: string) => void

  waitingResponse: boolean = false
  newPassword: string | null = null
  confirmPassword: string | null = null
  MAXIMUM_NUMBER_OF_CHARACTERS: number = 75

  sendRequest() {
    // tslint:disable-next-line:max-line-length
    const hasError = this.inputHasError(this.newPassword, this.MAXIMUM_NUMBER_OF_CHARACTERS) || this.inputHasError(this.confirmPassword, this.MAXIMUM_NUMBER_OF_CHARACTERS)

    if (this.newPassword !== this.confirmPassword)
      this.pushAlert({
        name: 'The passwords don\'t match.',
        duration: 8,
        type: 'error',
      })
    else if (!hasError && this.newPassword && this.confirmPassword) {
      this.waitingResponse = true
      firebase.auth().confirmPasswordReset(this.popUpPayload, this.newPassword).then(() => {
        this.pushAlert({
          name: 'Your password has been reset successfully.',
          duration: 5,
          type: 'success',
        })
        this.pushPopUp('SigninPopup')
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

  get newPasswordClass() {
    return [
      this.theme,
      {wrong: this.inputHasError(this.newPassword, this.MAXIMUM_NUMBER_OF_CHARACTERS)},
    ]
  }
  get confirmPasswordClass() {
    return [
      this.theme,
      {wrong: this.inputHasError(this.confirmPassword, this.MAXIMUM_NUMBER_OF_CHARACTERS)},
    ]
  }
}

</script>

<style scoped src='@/assets/css/authPopUp.css'>
</style>
