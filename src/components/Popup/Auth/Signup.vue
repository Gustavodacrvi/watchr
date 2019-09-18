<template>
  <div class="Signup cb rb" :class="platform" @click.stop="">
    <div class="tac title">
      <h3 class="pc">Create an Account</h3>
    </div>
    <div class="content">
      <InputApp
        placeholder='E-mail:'
        :focus="true"
        v-model="password"
      />
      <InputApp
        class="mt"
        placeholder='Password:'
        v-model="eMail"
      />
      <ButtonApp
        class="mt"
        value='Create account'
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
      password: ''
    }
  },
  computed: mapGetters(['platform']),
}

</script>

<style scoped>

.mt {
  margin-top: 8px;
}

.Signup.desktop {
  margin-top: 100px;
  flex-basis: 650px;
}

.title {
  overflow: hidden;
}

.content {
  margin: 28px;
  margin-top: 0;
}

</style>
