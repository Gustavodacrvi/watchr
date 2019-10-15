<template>
  <div class="Signin popup cb shadow rb" :class="platform">
    <div class="tac title">
      <h3 class="pc">{{ l['Sign in'] }}</h3>
    </div>
    <div class="content">
      <SigninOptions/>
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
      <ButtonApp
        class="mt"
        :value='l["Sign in"]'
        @click="signIn"
      />
    </div>
  </div>
</template>

<script>

import InputVue from '../../Auth/Input.vue'
import ButtonVue from '../../Auth/Button.vue'
import SigninOptions from './SigninOptions.vue'

import { mapGetters } from 'vuex'

import firebase from 'firebase/app'

export default {
  components: {
    InputApp: InputVue,
    ButtonApp: ButtonVue,
    SigninOptions,
  },
  data() {
    return {
      eMail: '',
      password: '',
    }
  },
  methods: {
    signIn() {
      const toast = (toast) => this.$store.commit('pushToast', toast)
      if (this.atLeastOneEmpty)
        toast({
          name: this.l["Fill in all the required fields."],
          type: "error",
          seconds: 4,
        })
      else {
        const auth = firebase.auth()
        auth.signInWithEmailAndPassword(this.eMail, this.password).then(() => {
          toast({
            name: this.l['You have successfully logged in!'],
            type: 'success',
            seconds: 3,
          })
          if (auth.currentUser && !auth.currentUser.emailVerified)
            toast({
              name: this.l['Please confirm your e-mail address.'],
              type: 'warning',
              seconds: 4,
            })
          this.$store.commit('closePopup')
          this.$store.commit('toggleUser', true)
          this.$router.push("/user")
          window.location.reload()
        }).catch(err => {
          toast({
            name: err.message,
            type: 'error',
            seconds: 3,
          })
        })
      }
    }
  },
  computed: {
    ...mapGetters(['platform', 'l']),
    atLeastOneEmpty() {
      const { eMail, password } = this
      return eMail === '' || password === ''
    },
  },
}

</script>

<style scoped src="@/assets/css/popupAuth.css">
</style>
