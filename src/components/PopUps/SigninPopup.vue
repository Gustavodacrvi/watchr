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
      <form-button :waiting-response='waitingResponse' @click='sendRequest'>
        Sign in
      </form-button>
      <div class='margin links'>
        <span @click='resetPasswordPoUp' class='link'>Forgot password?</span>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Watch } from 'vue-property-decorator'
import { State, Mutation, Getter } from 'vuex-class'

import firebase from 'firebase/app'
import { Alert } from '../../interfaces/app'

import FormInput from '@/components/PopUps/FormComponents/FormInput.vue'
import FormPassword from '@/components/PopUps/FormComponents/FormPassword.vue'
import FormButton from '@/components/PopUps/FormComponents/FormButton.vue'

@Component({
  components: {
    'form-input': FormInput,
    'form-password': FormPassword,
    'form-button': FormButton,
  },
})
export default class SigninPopUp extends Vue {
  @State theme!: string
  @Mutation pushPopUp!: (compName: string) => void
  @Mutation pushAlert!: (alert: Alert) => void

  email: string | null = null
  password: string | null = null
  passwordState: boolean = false
  emailState: boolean = false

  waitingResponse: boolean = false

  resetPasswordPoUp() {
    this.pushPopUp('SendresetpasswordPopup')
  }
  sendRequest() {
    if (this.emailState && this.passwordState) {
      this.waitingResponse = true
      firebase.auth().signInWithEmailAndPassword(this.email as any, this.password as any).then(() => {
        this.pushAlert({
          name: 'You have successfully logged in!',
          duration: 3,
          type: 'success',
        })
        const auth = firebase.auth()
        if (auth.currentUser && !auth.currentUser.emailVerified)
          this.pushAlert({
            name: 'Please confirm your e-mail address.',
            duration: 4,
            type: 'warning',
          })
        this.$router.push({name: 'User'})
        this.pushPopUp('')
        this.waitingResponse = false

        const messaging = firebase.messaging()
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            console.log('granted')
          } else {
            console.log('unable to get permission')
          }
        })

        messaging.getToken().then(currentToken => {
          if (currentToken) {
            
          }
        })
      }).catch((error: any) => {
        this.waitingResponse = false
        this.pushAlert({
          name: error.message,
          duration: 6,
          type: 'error',
        })
      })
    }
  }
}

</script>

<style scoped src='@/assets/css/authPopUp.css'>
</style>
