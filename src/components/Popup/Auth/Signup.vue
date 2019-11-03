<template>
  <div class="Signup popup cb shadow rb scroll" :class="platform">
    <div class="tac title">
      <h3 class="pc">{{ l['Create an Account'] }}</h3>
    </div>
    <div class="content">
      <SigninOptions
        :isUpgrading='isUpgrading'
        @google='upgradeAccountToGoogle'
      />
      <InputApp
        :placeholder='l["Username (Optional)"] + ":"'
        :focus="true"
        :value='username'
        @input='v => username = v'
        @cancel="$emit('close')"
      />
      <InputApp
        class="mt"
        :placeholder='l["E-mail"] + ":"'
        :value='eMail'
        @input='v => eMail = v'
        @cancel="$emit('close')"
      />
      <InputApp
        class="mt"
        :placeholder='l["Password"] + ":"'
        type="password"
        :value='password'
        @input='v => password = v'
        @cancel="$emit('close')"
      />
      <InputApp
        class="mt"
        type="password"
        :placeholder='l["Confirm password"] + ":"'
        :value='conPassword'
        @input='v => conPassword = v'
        @cancel="$emit('close')"
      />
      <ButtonApp
        class="mt"
        :value='l["Create account"]'
        @click="createAccount"
      />
      <div v-if="!isDesktop" style="height: 400px"></div>
    </div>
  </div>
</template>

<script>

import InputVue from '../../Auth/Input.vue'
import ButtonVue from '../../Auth/Button.vue'
import SigninOptions from './SigninOptions.vue'

import { mapGetters, mapState } from 'vuex'

import firebase from 'firebase/app'

export default {
  props: ['payload'],
  components: {
    InputApp: InputVue,
    ButtonApp: ButtonVue,
    SigninOptions,
  },
  data() {
    return {
      eMail: '',
      username: '',
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
          name: this.l["Fill in all the required fields."],
          type: "error",
          seconds: 4,
        })
      else if (this.tooLong)
        toast({
          name: this.l["The maximum number of characters is 75."],
          type: "error",
          seconds: 4,
        })
      else if (this.notEqual)
        toast({
          name: this.l["The passwords aren't matching."],
          type: "error",
          seconds: 4,
        })
      else if (!this.isUpgrading) {
        const auth = firebase.auth()
        auth.createUserWithEmailAndPassword(this.eMail, this.password).then(() => {
          if (this.username) auth.currentUser.updateProfile({
            displayName: this.username,
          })
          const uid = auth.currentUser.uid
          toast({
            name: this.l['You have successfully created an account!'],
            seconds: 3,
            type: 'success'
          })
          auth.currentUser.sendEmailVerification().then(() => {
            toast({
              name: this.l['An email confirmation has been sent to your email address. Please check your inbox and click the confirmation link.'],
              seconds: 6,
              type: 'warning',
            })
          }).catch(err => toastErr(err))
          this.$store.dispatch('createUser', {
            ...firebase.auth().currentUser, displayName: this.username,
          }).catch(err => {
            auth.currentUser.delete()
            toastErr(err)
          })
          this.$store.commit('closePopup')
          this.$store.commit('toggleUser', true)
          this.$router.push('/user')
        }).catch(err => toastErr(err))
      } else this.upgradeAccountWithEmailAndPassword()
    },
    upgradeAccountToGoogle() {
      const provider = new firebase.auth.GoogleAuthProvider()
      firebase.auth().currentUser.linkWithPopup(provider).then(res => {
        this.$store.dispatch('update', res.user).then(el => {
          this.$store.commit('closePopup')
          window.location.reload()
        })
      }).catch(err => {
        this.$store.commit('pushToast', {
          name: err.message,
          seconds: 4,
          type: 'error'
        })
      })
    },
    upgradeAccountWithEmailAndPassword() {
      const provider = new firebase.auth.EmailAuthProvider.credential(this.eMail, this.password)
      firebase.auth().currentUser.linkWithCredential(provider).then(res => {
        this.$store.dispatch('update', res.user).then(el => {
          res.user.sendEmailVerification()
          window.location.reload()
        }).catch(err => {
          this.$store.dispatch('pushToast', {
            name: err.message,
            seconds: 4,
            type: 'error'
          })
          res.user.delete()
        })
      })
      .catch(err => {
        this.$store.commit('pushToast', {
          name: err.message,
          seconds: 4,
          type: 'error'
        })
      })
    },
  },
  computed: {
    ...mapGetters(['isDesktop']),
    isUpgrading() {
      return this.payload
    },
    tooLong() {
      const { eMail, password, conPassword, username } = this
      return eMail.length > 75 || password.length > 75 || conPassword.length > 75 || username.length > 50
    },
    atLeastOneEmpty() {
      const { eMail, password, conPassword } = this
      return eMail === '' || password === '' || conPassword === ''
    },
    notEqual() {
      return this.password !== this.conPassword
    },
    ...mapGetters(['platform', 'l'])
  },
}

</script>

<style scoped src="@/assets/css/popupAuth.css">
</style>

<style scoped>

.Signup.desktop {
  transform: translateY(-16px);
}

</style>
