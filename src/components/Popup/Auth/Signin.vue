<template>
  <div class="Signup cb rb" :class="platform" @click.stop="">
    <div class="tac title">
      <h3 class="pc">Sign in</h3>
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
        v-model="password"
      />
      <ButtonApp
        class="mt"
        value='Sign in'
        @click="signIn"
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
    }
  },
  methods: {
    signIn() {
      if (this.atLeastOneEmpty)
        this.$store.commit('pushToast', {
          name: "Fill in all the required fields.",
          type: "error",
          seconds: 3,
        })
      else {
        const auth = firebase.auth()
        auth.signInWithEmailAndPassword(this.eMail, this.password).then(() => {
          this.$store.commit('pushToast', {
            name: 'You have successfully logged in!',
            type: 'success',
            seconds: 3,
          })
          if (auth.currentUser && !auth.currentUser.emailVerified)
            this.$store.commit('pushToast', {
              name: 'Please confirm your e-mail address.',
              type: 'warning',
              seconds: 4,
            })

          this.$store.commit('closePopup')
          this.$store.commit('toggleUser', true)
          this.$router.push("/user")
        }).catch(err => {
          this.$store.commit('pushToast', {
            name: err.message,
            type: 'error',
            seconds: 3,
          })
        })
      }
    }
  },
  computed: {
    atLeastOneEmpty() {
      const { eMail, password } = this
      return eMail === '' || password === ''
    },
    ...mapGetters(['platform'])
  },
}

</script>

<style scoped src="@/assets/css/popupAuth.css">
</style>
