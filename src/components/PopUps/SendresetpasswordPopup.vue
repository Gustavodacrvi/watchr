<template>
  <div :class='theme'>
    <div class='title'>
      <h2>Send reset password e-mail</h2>
    </div>
    <div class='content'>
      <form-input
        placeholder='E-mail'
        v-model='email'
        @state='e => emailState = e'
      />
      <form-button :waiting-response='waitingResponse' @click='sendRequest'>
        Send reset password e-mail
      </form-button>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { State, Mutation } from 'vuex-class'

import firebase from 'firebase/app'
import { Alert } from '@/interfaces/app'

import FormInput from '@/components/PopUps/FormComponents/FormInput.vue'
import FormButton from '@/components/PopUps/FormComponents/FormButton.vue'

@Component({
  components: {
    'form-button': FormButton,
    'form-input': FormInput,
  },
})
export default class ResetPasswordPopUp extends Vue {
  @State theme!: string
  @Mutation pushAlert!: (alert: Alert) => void
  @Mutation pushPopUp!: (compName: string) => void

  email: string | null = null
  emailState: boolean = false

  waitingResponse: boolean = false
  sendRequest() {
    if (this.emailState && this.email !== null) {
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
}

</script>

<style scoped src='@/assets/css/authPopUp.css'>
</style>
