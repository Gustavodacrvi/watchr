<template>
  <div class="Signup popup cb shadow rb" :class="platform">
    <div class="tac title">
      <h3 class="pc">{{ l['Create an Account'] }}</h3>
    </div>
    <div class="content">
      <InputApp
        :placeholder='l["E-mail"] + ":"'
        :focus="true"
        v-model="eMail"
      />
      <InputApp
        class="mt"
        :placeholder='l["Password"] + ":"'
        type="password"
        v-model="password"
      />
      <InputApp
        class="mt"
        type="password"
        :placeholder='l["Confirm password"] + ":"'
        v-model="conPassword"
      />
      <ButtonApp
        class="mt"
        :value='l["Create account"]'
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
      else {
        const auth = firebase.auth()
        auth.createUserWithEmailAndPassword(this.eMail, this.password).then(() => {
          const uid = auth.currentUser.uid
          toast({
            name: this.l['You have successfully created an account!'],
            seconds: 3,
            type: 'error'
          })
          auth.currentUser.sendEmailVerification().then(() => {
            toast({
              name: this.l['An email confirmation has been sent to your email address. Please check your inbox and click the confirmation link.'],
              seconds: 6,
              type: 'warning',
            })
          }).catch(err => toastErr(err))
          this.$store.dispatch('tag/addDefaultData', uid)
          this.$store.dispatch('list/addDefaultData', uid)
          this.$store.dispatch('filter/addDefaultData', uid)
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
    ...mapGetters(['platform', 'l'])
  },
}

</script>

<style scoped src="@/assets/css/popupAuth.css">
</style>
