<template>
  <div class="Signup cb rb" :class="platform" @click.stop="">
    <div class="tac title">
      <h3 class="pc">Create an Account</h3>
    </div>
    <div class="content">
      <InputApp
        placeholder='E-mail:'
        :focus="true"
        v-model="eMail"
      />
      <InputApp
        class="mt"
        placeholder='Password:'
        type="password"
        v-model="password"
      />
      <InputApp
        class="mt"
        type="password"
        placeholder='Confirm password:'
        v-model="conPassword"
      />
      <ButtonApp
        class="mt"
        value='Create account'
        @click="createAccount"
      />
    </div>
  </div>
</template>

<script>

import InputVue from '../../Auth/Input.vue'

import { mapGetters } from 'vuex'
import ButtonVue from '../../Auth/Button.vue'

import firebase from 'firebase/app'

export default {
  components: {
    InputApp: InputVue,
    ButtonApp: ButtonVue,
  },
  data() {
    return {
      eMail: '',
      password: '',
      conPassword: '',
    }
  },
  methods: {
    createAccount() {
      const toast = (toast) => this.$store.commit('pushToast', toast)
      const toastErr = (err) => {
        toast({
          name: err.message,
          type: 'error',
          seconds: 6,
        })
      }
      if (this.atLeastOneEmpty)
        toast({
          name: "Fill in all the required fields.",
          type: "error",
          seconds: 4,
        })
      else if (this.tooLong)
        toast({
          name: "The maximum number of characters is 75.",
          type: "error",
          seconds: 4,
        })
      else if (this.notEqual)
        toast({
          name: "The passwords aren't matching.",
          type: "error",
          seconds: 4,
        })
      else {
        const auth = firebase.auth()
        auth.createUserWithEmailAndPassword(this.eMail, this.password).then(() => {
          toast({
            name: 'You have successfully created an account!',
            seconds: 3,
            type: 'error'
          })
          auth.currentUser.sendEmailVerification().then(() => {
            toast({
              name: 'An email confirmation has been sent to your email address. Please check your inbox and click the confirmation link.',
              seconds: 6,
              type: 'warning',
            })
          }).catch(err => toastErr(err))
          this.$store.commit('closePopup')
          this.$store.commit('toggleUser', true)
          this.$router.push('/user')
        }).catch(err => toastErr(err))
      }
    }
  },
  computed: {
    tooLong() {
      const { eMail, password, conPassword } = this
      return eMail.length > 75 || password.length > 75 || conPassword > 75
    },
    atLeastOneEmpty() {
      const { eMail, password, conPassword } = this
      return eMail === '' || password === '' || conPassword === ''
    },
    notEqual() {
      return this.password !== this.conPassword
    },
    ...mapGetters(['platform'])
  },
}

</script>

<style scoped src="@/assets/css/popupAuth.css">
</style>
