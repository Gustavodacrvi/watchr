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
      >Sign in</button>
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

@Component
export default class SigninPopUp extends Mixins(Mixin) {
  @State theme!: string
  @Mutation pushPopUp!: (compName: string) => void

  email: string | null = null
  password: string | null = null
  newPassword: string | null = null
  waitingResponse: boolean = false

  sendRequest() {
    const auth = firebase.auth()
    
    const hasError: boolean = this.inputHasError(this.email, MAXIMUM_NUMBER_OF_CHARACTERS) ||
    this.inputHasError(this.password, MAXIMUM_NUMBER_OF_CHARACTERS) ||
    this.inputHasError(this.newPassword, MAXIMUM_NUMBER_OF_CHARACTERS)

    console.log(hasError)
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
