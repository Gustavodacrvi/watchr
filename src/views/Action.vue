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
    const reload = () => {
      auth.currentUser.reload().then(() => {
        this.$router.push('/user')
      })
    }
    const toastErr = (err) => {
      toast({
        name: err.message,
        type: 'error',
        seconds: 6,
      })
    }
    switch (this.mode) {
      case 'verifyEmail': {
        auth.applyActionCode(this.oobCode).then(() => {
          toast({
            name: 'E-mail confirmed successfully!',
            seconds: 6,
            type: 'success',
          })
          reload()
        }).catch(err => {
          toastErr(err)
          reload()
        })
        break
      }
      case 'resetPassword': {
        auth.verifyPasswordResetCode(this.oobCode).then(() => {
          // push resetpassword popup
        }).catch(err => {
          toastErr(err)
          reload()
        })
      }
    }
  }
}

</script>
