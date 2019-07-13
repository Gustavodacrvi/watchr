<template>
  
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'
import { State, Mutation } from 'vuex-class'

import firebase from 'firebase/app'
import { Alert } from '../interfaces/app'

@Component
export default class ResetPasswordView extends Vue {
  @State currentUser!: firebase.User | null
  @Mutation pushAlert!: (alert: Alert) => void
  @Mutation pushPopUp!: (compName: string) => void
  @Mutation pushPopUpPayload!: (code: string) => void
  @Mutation saveCurrentUser!: (user: firebase.User | null) => void
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
        this.reload()
      }).catch(error => {
        this.pushAlert({
          name: error.message,
          duration: 8,
          type: 'error',
        })
        this.reload()
      })
    else if (this.mode === 'resetPassword')
      firebase.auth().verifyPasswordResetCode(this.oobCode).then(e => {
        this.pushPopUp('ResetpasswordPopup')
        this.pushPopUpPayload(this.oobCode)
      }).catch(error => {
        this.pushAlert({
          name: error.message,
          duration: 8,
          type: 'error',
        })
      })
  }

  reload() {
    const auth = firebase.auth()
    if (auth.currentUser !== null)
      auth.currentUser.reload().then(() => {
        this.saveCurrentUser(firebase.auth().currentUser)
      })
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
