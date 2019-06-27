<template>
  <div :class='theme'>
    <div class='title'>
      <h2>Reset password</h2>
    </div>
    <div class='content'>
      <form-password
        placeholder='New password: '
        v-model='newPassword'
        :max='75'
        @state='e => newPasswordState = e'
      />
      <form-password
        placeholder='Confirm password: '
        v-model='confirmPassword'
        :max='75'
        @state='e => confirmPasswordState = e'
      />
      <form-button :waiting-response='waitingResponse' @click='sendRequest'>
        Reset password
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
    'form-input': FormInput,
    'form-button': FormButton,
  },
})
export default class ResetPasswordPopUp extends Vue {
  @State theme!: string
  @State popUpPayload!: string
  @Mutation pushAlert!: (alert: Alert) => void
  @Mutation pushPopUp!: (compName: string) => void

  newPassword: string | null = null
  confirmPassword: string | null = null
  newPasswordState: boolean = false
  confirmPasswordState: boolean = false

  waitingResponse: boolean = false

  sendRequest() {
    if (this.newPassword !== this.confirmPassword)
      this.pushAlert({
        name: 'The passwords don\'t match.',
        duration: 3,
        type: 'error',
      })
    else if (this.newPasswordState && this.confirmPasswordState && this.newPassword !== null) {
      this.waitingResponse = true
      firebase.auth().confirmPasswordReset(this.popUpPayload, this.newPassword).then(() => {
        this.pushAlert({
          name: 'Your password has been reset successfully.',
          duration: 4,
          type: 'success',
        })
        this.pushPopUp('SigninPopup')
        this.waitingResponse = false
      }).catch((error: any) => {
        this.pushAlert({
          name: error.message,
          duration: 6,
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
