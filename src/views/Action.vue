<template>
  
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'
import { State, Mutation } from 'vuex-class'

import firebase, { app } from 'firebase/app'
import { Alert } from '../interfaces/app'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faEye, faEyeSlash, faSync } from '@fortawesome/free-solid-svg-icons'

library.add(faEye, faEyeSlash, faSync)

@Component
export default class ResetPasswordView extends Vue {
  @State currentUser!: firebase.User
  @Mutation pushAlert!: (alert: Alert) => void
  @Mutation pushPopUp!: (compName: string) => void
  @Mutation pushPopUpPayload!: (code: string) => void
  @Prop() mode!: string
  @Prop() oobCode!: string

  created() {
    this.$router.push({name: 'User'})
    if (this.mode === 'verifyEmail')
      firebase.auth().applyActionCode(this.oobCode).then(() => {
        this.pushAlert({
          name: 'E-mail confirmed successfully',
          duration: 5,
          type: 'success',
        })
        this.currentUser.reload()
      }).catch((error: any) => {
        this.pushAlert({
          name: error.message,
          duration: 8,
          type: 'error',
        })
        this.currentUser.reload()
      })
    else if (this.mode === 'resetPassword') {
      firebase.auth().verifyPasswordResetCode(this.oobCode).then((e) => {
        this.pushPopUp('ResetpasswordPopup')
        this.pushPopUpPayload(this.oobCode)
      }).catch((error) => {
        this.pushAlert({
          name: error.message,
          duration: 8,
          type: 'error',
        })
      })
    }
  }
}

</script>

<style scoped>

.action {
  margin: 0 12px;
  margin-top: 120px;
}

</style>

<style scoped src='@/assets/css/authPopUp.css'>
</style>
