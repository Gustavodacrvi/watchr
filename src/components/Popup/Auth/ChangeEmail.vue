<template>
  <div class="Signin popup cb shadow rb" :class="platform">
    <div class="tac title">
      <h3 class="pc">Change E-mail</h3>
    </div>
    <div class="content">
      <InputApp
        placeholder='E-mail'
        type="text"
        :value='email'
        :focus='true'
        @cancel="$emit('close')"
        @input='v => email = v'
      />
      <ButtonApp
        class="mt"
        value='Save'
        @click="update"
      />
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
  components: {
    InputApp: InputVue,
    ButtonApp: ButtonVue,
    SigninOptions,
  },
  data() {
    return {
      email: '',
    }
  },
  created() {
    this.email = this.user.email
  },
  methods: {
    update() {
      const toast = t => this.$store.commit('pushToast', t)
      if (!this.email)
        toast({
          name: "Fill in all the required fields.",
          type: "error",
          seconds: 4,
        })
      else if (this.email.length > 50)
        toast({
          name: "The maximum number of characters is 75.",
          type: "error",
          seconds: 4,
        })
      else {
        firebase.auth().currentUser.updateEmail(this.email).catch(err => toast({
          name: err.message,
          type: 'error',
          seconds: 4,
        })).then(() => {
          this.$store.dispatch('update', {
            ...this.user,
            email: this.email})
          toast({
            name: 'An e-mail has been sent to your e-mail account to proceed, click on the provided link to proceed.',
            seconds: 6,
            type: 'success',
          })
          this.$store.dispatch('closePopup')
        })
      }
    },
  },
  computed: {
    ...mapState(['popup', 'user']),
    ...mapGetters(['platform']),
  },
}

</script>

<style scoped src="@/assets/css/popupAuth.css">
</style>
