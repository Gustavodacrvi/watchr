<template>
  <div class="Signin popup cb shadow rb" :class="layout">
    <div class="tac title">
      <h3 class="pc">Change/Add Username</h3>
    </div>
    <div class="content">
      <InputApp
        placeholder='Username:'
        type="text"
        :value='username'
        :focus='true'
        @cancel="$emit('close')"
        @input='v => username = v'
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
      username: '',
    }
  },
  created() {
    this.username = this.user.displayName
  },
  methods: {
    update() {
      const toast = t => this.$store.commit('pushToast', t)
      if (!this.username)
        toast({
          name: "Fill in all the required fields.",
          type: "error",
          seconds: 4,
        })
      else if (this.username.length > 50)
        toast({
          name: "The maximum number of characters is 50.",
          type: "error",
          seconds: 4,
        })
      else {
        this.$store.dispatch('update', {
          ...this.user,
          displayName: this.username
        })
        firebase.auth().currentUser.updateProfile({
          displayName: this.username,
        }).catch(err => toast({
          name: err.message,
          type: 'error',
          seconds: 4,
        }))
        if (this.popup.callback) this.popup.callback()
        this.$store.dispatch('closePopup')
      }
    },
  },
  computed: {
    ...mapState(['popup', 'user']),
    ...mapGetters(['layout']),
  },
}

</script>

<style scoped src="@/assets/css/popupAuth.css">
</style>
