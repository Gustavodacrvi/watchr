<template>
  
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'
import { State, Mutation } from 'vuex-class'

import firebase from 'firebase/app'
import { Alert } from '../interfaces/app'

@Component
export default class ResetPasswordView extends Vue {
  @State currentUser!: firebase.User
  @Mutation pushAlert!: (alert: Alert) => void
  @Prop() mode!: string
  @Prop() oobCode!: string

  created() {
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
          duration: 5,
          type: 'error',
        })
        this.currentUser.reload()
      })
      this.$router.push({name: 'User'})
  }
}

</script>

