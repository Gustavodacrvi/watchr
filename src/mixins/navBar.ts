
import { Component, Vue } from 'vue-property-decorator'
import { Mutation, State } from 'vuex-class'

import firebase from 'firebase/app'
import { Alert } from '@/interfaces/app'


@Component
export default class NavbarMixin extends Vue {
  @Mutation pushAlert!: (alert: Alert) => void

  signOut() {
    firebase.auth().signOut().then(() => {
      this.pushAlert({
        name: 'You have successfully signed out!',
        duration: 3,
        type: 'success',
      })
      this.$forceUpdate()
    })
  }
  resendConfirmationEmail() {
    const user = firebase.auth().currentUser
    if (user)
      user.sendEmailVerification().then(() => {
        this.pushAlert({
          // tslint:disable-next-line:max-line-length
          name: 'An email confirmation has been sent to your email address. Please check your inbox and click the confirmation link.',
          duration: 4,
          type: 'normal',
        })
      }).catch(error => {
        this.pushAlert({
          name: error.message,
          duration: 6,
          type: 'error',
        })
      })
  }

  get isLogged() {
    const user = firebase.auth().currentUser
    if (user === null)
      return false
    return true
  }
  get confirmedEmail() {
    const user = firebase.auth().currentUser
    if (user && user.emailVerified)
      return true
    return false
  }
}
