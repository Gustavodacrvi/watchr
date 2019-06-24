<template>
  <div class='signin-popup' :class='theme'>
    <div class='title'>
      <h2>Sign in</h2>
    </div>
    <div class='content'>
      <input
        class='margin input txt round-border gray'
        placeholder='Username: '
        type='text'
        autocomplete='off'
        :class='usernameClass'
        v-model.trim='username'
      >
      <div class='margin password'>
        <input
          class='input txt round-border gray'
          placeholder='Password: '
          :type='passwordType'
          autocomplete='off'
          :class='passwordClass'
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
      <div class='margin links'>
        <span class='link'>Forgot password?</span>
        <span class='link'>Forgot username?</span>
      </div>
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

@Component
export default class SigninPopUp extends Mixins(Mixin) {
  @State theme!: string
  @Mutation pushPopUp!: (compName: string) => void

  MAXIMUM_NUMBER_OF_CHARACTERS: number = 50

  username: string | null = null
  password: string | null = null

  waitingResponse: boolean = false

  sendRequest() {
    const hasError: boolean = this.inputHasError(this.username, this.MAXIMUM_NUMBER_OF_CHARACTERS)
     || this.inputHasError(this.password, this.MAXIMUM_NUMBER_OF_CHARACTERS)
  }

  get usernameClass(): any[] {
    return [
      this.theme,
      {wrong: this.inputHasError(this.username, this.MAXIMUM_NUMBER_OF_CHARACTERS)},
    ]
  }
  get passwordClass(): any[] {
    return [
      this.theme,
      {wrong: this.inputHasError(this.password, this.MAXIMUM_NUMBER_OF_CHARACTERS)},
    ]
  }
}

</script>

<style scoped src='@/assets/css/authPopUp.css'>
</style>
