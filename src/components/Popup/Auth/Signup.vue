<template>
  <div class="Signup cb rb" :class="platform" @click.stop="">
    <div class="tac title">
      <h3 class="pc">Create an Account</h3>
    </div>
    {{eMail}}
    <InputApp
      v-model="eMail"
      :focus="true"
    />
  </div>
</template>

<script>

import InputVue from '../../Auth/Input.vue'

import { mapGetters } from 'vuex'

export default {
  components: {
    InputApp: InputVue,
  },
  data() {
    return {
      eMail: '',
    }
  },
  computed: mapGetters(['platform']),
}

</script>

<style scoped>

.Signup.desktop {
  margin-top: 100px;
  flex-basis: 600px;
}

.title {
  overflow: hidden;
}

</style>
