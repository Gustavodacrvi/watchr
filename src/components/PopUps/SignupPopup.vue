<template>
  <div class='signin-popup' :class='theme'>
    <div class='title'>
      <h2>Sign up</h2>
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
      <div class='margin password'>
        <input
          class='input txt round-border gray'
          placeholder='New password: '
          :type='passwordType'
          autocomplete='off'
          :class='newPasswordClass'
          v-model.trim='password'
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
          :class='confirmPasswordClass' v-model.trim='newPassword'>
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
import { State, Mutation, Getter } from 'vuex-class'
import Mixin from '@/mixins/authPopUp'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faEye, faEyeSlash, faSync } from '@fortawesome/free-solid-svg-icons'

library.add(faEye, faEyeSlash, faSync)

const MAXIMUM_NUMBER_OF_CHARACTERS: number = 50

import firebase from 'firebase/app'
import { Alert } from '../../interfaces/app'

@Component
export default class SigninPopUp extends Mixins(Mixin) {
  @State theme!: string
  @Mutation pushPopUp!: (compName: string) => void
  @Mutation pushAlert!: (alert: Alert) => void

  email: string | null = null
  password: string | null = null
  newPassword: string | null = null
  waitingResponse: boolean = false

  sendRequest() {
    const auth = firebase.auth()
    
    const hasError: boolean = this.inputHasError(this.email, MAXIMUM_NUMBER_OF_CHARACTERS) ||
    this.inputHasError(this.password, MAXIMUM_NUMBER_OF_CHARACTERS) ||
    this.inputHasError(this.newPassword, MAXIMUM_NUMBER_OF_CHARACTERS)

    if (this.password !== this.newPassword)
      this.pushAlert({
        name: "Passwords don't match",
        duration: 3,
        type: 'error',
      })
    else if (!hasError && this.email && this.password && this.newPassword)
      this.waitingResponse = true
      auth.createUserWithEmailAndPassword(this.email as any, this.newPassword as any).then((cred: any) => {
        this.pushAlert({
          name: 'You have successfully created an account!',
          duration: 3,
          type: 'success',
        })
        if (auth.currentUser)
          auth.currentUser.sendEmailVerification().then(() => {
            this.pushAlert({
              name: 'An email confirmation has been sent to your email address. Please check your inbox and click the confirmation link',
              duration: 3,
              type: 'normal',
            })
          })
        this.pushPopUp('')
        this.$router.push('User')
        this.waitingResponse = false
      }).catch((error: any) => {
        this.waitingResponse = false
        this.pushAlert({
          name: error.message,
          duration: 3,
          type: 'error',
        })
      })
  }

  get emailClass() {
    return [
      this.theme,
      {wrong: this.inputHasError(this.email, MAXIMUM_NUMBER_OF_CHARACTERS)},
    ]
  }
  get newPasswordClass() {
    return [
      this.theme,
      {wrong: this.inputHasError(this.password, MAXIMUM_NUMBER_OF_CHARACTERS)},
    ]
  }
  get confirmPasswordClass() {
    return [
      this.theme,
      {wrong: this.inputHasError(this.newPassword, MAXIMUM_NUMBER_OF_CHARACTERS)},
    ]
  }
}

</script>

<style scoped src='@/assets/css/authPopUp.css'>
</style>
