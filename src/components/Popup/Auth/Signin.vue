<template>
  <div class="Signin popup cb shadow rb scroll-thin" :class="layout">
    <div class="tac title">
      <h3 class="pc">Sign in</h3>
    </div>
    <div class="content">
      <SigninOptions/>
      <InputApp
        placeholder='E-mail:'
        :value='eMail'
        @input='v => eMail = v'
        @cancel="$emit('close')"
      />
      <InputApp
        class="mt"
        placeholder='Password:'
        type="password"
        :value='password'
        @cancel="$emit('close')"
        @input='v => password = v'
      />
      <ButtonApp
        class="mt"
        value='Sign in'
        @click="signIn"
      />
      <div v-if="!isDesktopBreakPoint" style="height: 400px"></div>
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
          name: "Fill in all the required fields.",
          type: "error",
          seconds: 4,
        })
      else {
        const auth = firebase.auth()
        auth.signInWithEmailAndPassword(this.eMail, this.password).then(() => {
          toast({
            name: 'You have successfully logged in!',
            type: 'success',
            seconds: 3,
          })
          if (auth.currentUser && !auth.currentUser.emailVerified)
            toast({
              name: 'Please confirm your e-mail address.',
              type: 'warning',
              seconds: 4,
            })
          this.$store.commit('toggleUser', true)
          this.$router.push("/user")
          this.$store.dispatch('closePopup')
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
    ...mapGetters(['layout', 'isDesktopBreakPoint']),
    atLeastOneEmpty() {
      const { eMail, password } = this
      return eMail === '' || password === ''
    },
  },
}

</script>

<style scoped src="@/assets/css/popupAuth.css">
</style>
