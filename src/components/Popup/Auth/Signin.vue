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
      if (this.atLeastOneEmpty) console.log('all empty')
      console.log('Sign in ')
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
