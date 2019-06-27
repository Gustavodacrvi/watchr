
import { Component, Vue } from 'vue-property-decorator'
import { Mutation, State } from 'vuex-class'

import firebase from 'firebase/app'
import { Alert } from '@/interfaces/app'


@Component
export default class NavbarMixin extends Vue {
  @State currentUser!: firebase.User | null
  @Mutation pushAlert!: (alert: Alert) => void

  signOut() {
    firebase.auth().signOut().then(() => {
      this.pushAlert({
        name: 'You have successfully signed out!',
        duration: 3,
        type: 'success',
      })
      this.$router.push({name: 'Home'})
      this.$forceUpdate()
    })
  }
  resendConfirmationEmail() {
    if (this.currentUser)
      this.currentUser.sendEmailVerification().then(() => {
        this.pushAlert({
          // tslint:disable-next-line:max-line-length
          name: 'An email confirmation has been sent to your email address. Please check your inbox and click the confirmation link',
          duration: 3,
          type: 'normal',
        })
      })
  }

  get isLogged() {
    if (this.currentUser === null)
      return false
    return true
  }
  get confirmedEmail() {
    if (this.currentUser && this.currentUser.emailVerified)
      return true
    return false
  }
}
