<template>
  <div class='signin-popup' :class='theme'>
    <div class='title'>
      <h2>Sign up</h2>
    </div>
    <div class='content'>
      <form-input
        placeholder='E-mail: '
        v-model='email'
        :max='75'
        @state='e => emailState = e'
      />
      <form-password
        placeholder='New password: '
        v-model='password'
        :max='75'
        @state='e => passwordState = e'
      />
      <form-password
        placeholder='Confirm password: '
        v-model='confirmPassword'
        :max='75'
        @state='e => confirmPasswordState = e'
      />
      <form-button :waiting-response='waitingResponse' @click='sendRequest'>
        Sign up
      </form-button>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { State, Mutation, Getter, namespace } from 'vuex-class'

const persVuex = namespace('perspective')
const label = namespace('label')

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

  @persVuex.Action addDefaultSmartPerspectives!: (id: string) => void
  @label.Action addLabelsOrder!: (id: string) => void

  email: string | null = null
  password: string | null = null
  confirmPassword: string | null = null
  emailState: boolean = false
  passwordState: boolean = false
  confirmPasswordState: boolean = false

  waitingResponse: boolean = false


  sendRequest() {
    const auth = firebase.auth()

    if (this.password !== this.confirmPassword)
      this.pushAlert({
        name: 'Passwords don\'t match.',
        duration: 4,
        type: 'error',
      })
    else if (this.emailState && this.passwordState && this.confirmPasswordState) {
      this.waitingResponse = true
      // tslint:disable-next-line:max-line-length
      auth.createUserWithEmailAndPassword(this.email as any, this.password as any).then((cred: firebase.auth.UserCredential) => {
        if (cred.user) {
          this.addDefaultSmartPerspectives(cred.user.uid)
          this.addLabelsOrder(cred.user.uid)
        }
        this.pushAlert({
          name: 'You have successfully created an account!',
          duration: 3,
          type: 'success',
        })
        if (auth.currentUser)
          auth.currentUser.sendEmailVerification().then(() => {
            this.pushAlert({
              // tslint:disable-next-line:max-line-length
              name: 'An email confirmation has been sent to your email address. Please check your inbox and click the confirmation link.',
              duration: 8,
              type: 'normal',
            })
          })
        this.pushPopUp('')
        this.$router.push({name: 'User'})
        this.waitingResponse = false
      }).catch(error => {
        this.waitingResponse = false
        this.pushAlert({
          name: error.message,
          duration: 4,
          type: 'error',
        })
      })
    }
  }
}

</script>

<style scoped src='@/assets/css/authPopUp.css'>
</style>
