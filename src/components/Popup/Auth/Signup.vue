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
        v-model="password"
      />
      <InputApp
        class="mt"
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
      if (this.atLeastOneEmpty) console.log('all empty')
      else if (this.tooLong) console.log('too long')
      else if (this.notEqual) console.log('not equal')
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