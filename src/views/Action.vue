<template>
  
</template>

<script>

import firebase from 'firebase/app'

export default {
  props: ['mode', 'oobCode'],
  created() {
    const auth = firebase.auth()
    const toast = (toast) => {
      this.$store.commit('pushToast', toast)
    }
    const toastErr = (err) => {
      toast({
        name: err.message,
        type: 'error',
        seconds: 6,
      })
    }
    switch (this.mode) {
      case 'recoverEmail': {
        firebase.auth().currentUser.sendEmailVerification()
        break
      }
      case 'verifyEmail': {
        auth.applyActionCode(this.oobCode).then(data => {
          toast({
            name: 'E-mail confirmed successfully!',
            seconds: 6,
            type: 'success',
          })
        }).catch(toastErr)
        break
      }
      case 'resetPassword': {
        auth.verifyPasswordResetCode(this.oobCode).then(() => {
          // push resetpassword popup
        }).catch(toastErr)
      }
    }
  }
}

</script>
