<template>
  <div :class='theme'>
    <div class='title'>
      <h2>Sign in</h2>
    </div>
    <div class='content'>
      <form-input
        placeholder='E-mail: '
        v-model='email'
        :max='75'
        @state='e => emailState = e'
      />
      <form-password
        placeholder='Password: '
        v-model='password'
        :max='75'
        @state='e => passwordState = e'
      />
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
        <span @click='resetPasswordPoUp' class='link'>Forgot password?</span>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Mixins, Watch } from 'vue-property-decorator'
import { State, Mutation, Getter } from 'vuex-class'
import Mixin from '@/mixins/authPopUp'

import firebase from 'firebase/app'
import { Alert } from '../../interfaces/app'

import FormInput from '@/components/PopUps/FormComponents/FormInput.vue'
import FormPassword from '@/components/PopUps/FormComponents/FormPassword.vue'

@Component({
  components: {
    'form-input': FormInput,
    'form-password': FormPassword,
  },
})
export default class SigninPopUp extends Mixins(Mixin) {
  @State theme!: string
  @Mutation pushPopUp!: (compName: string) => void
  @Mutation pushAlert!: (alert: Alert) => void

  MAXIMUM_NUMBER_OF_CHARACTERS: number = 75

  email: string | null = null
  password: string | null = null
  passwordState: boolean = false
  emailState: boolean = false

  waitingResponse: boolean = false

  resetPasswordPoUp() {
    this.pushPopUp('SendresetpasswordPopup')
  }
  sendRequest() {
    const hasError: boolean = this.inputHasError(this.email, this.MAXIMUM_NUMBER_OF_CHARACTERS)
     || this.inputHasError(this.password, this.MAXIMUM_NUMBER_OF_CHARACTERS)

    if (!hasError && this.email && this.password) {
      this.waitingResponse = true
      firebase.auth().signInWithEmailAndPassword(this.email as any, this.password as any).then(() => {
        this.pushAlert({
          name: 'You have successfully logged in!',
          duration: 5,
          type: 'success',
        })
        const auth = firebase.auth()
        if (auth.currentUser && !auth.currentUser.emailVerified)
          this.pushAlert({
            name: 'Please confirm your e-mail address.',
            duration: 5,
            type: 'warning',
          })
        this.$router.push({name: 'User'})
        this.pushPopUp('')
        this.waitingResponse = false
      }).catch((error: any) => {
        this.waitingResponse = false
        this.pushAlert({
          name: error.message,
          duration: 8,
          type: 'error',
        })
      })
    }
  }

  @Watch('password')
  p() {
    console.log(this.passwordState, this.emailState)
  }
  @Watch('email')
  d() {
    console.log(this.passwordState, this.emailState)
  }
}

</script>

<style scoped src='@/assets/css/authPopUp.css'>
</style>
