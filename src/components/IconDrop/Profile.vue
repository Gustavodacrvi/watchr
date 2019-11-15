
<template>
  <div class="Profile">
    <div class="margin">
      <ButtonApp
        type="card"
        :class="{white: user.displayName}"
        style='margin-top: 0'
        :value="displayName"
        @click="addDisplayName"
      />
      <ButtonApp
        type="card"
        class="white"
        style='margin-top: 0'
        :value="user.email"
        @click="changeEmail"
      />
      <h3>{{ l['Options'] }}</h3>
      <h4>{{ l['Appnav'] }}</h4>
    </div>
    <CheckboxApp
      name="I am a checkbox"
      v-model="check"
    />
  </div>
</template>

<script>

import ButtonVue from '../Auth/Button.vue'
import CheckboxApp from '../Auth/Checkbox.vue'

import { mapState, mapGetters } from 'vuex'

export default {
  props: ['content'],
  components: {
    CheckboxApp,
    ButtonApp: ButtonVue,
  },
  data() {
    return {
      check: false,
    }
  },
  methods: {
    addDisplayName() {
      console.log('add display name')
    },
    changeEmail() {
      console.log('change email')
    },
  },
  computed: {
    ...mapState(['user']),
    ...mapGetters(['l']),
    displayName() {
      if (this.user.displayName) return this.user.displayName
      return this.l['Add username']
    },
  },
}

</script>

<style scoped>

.Profile {
  width: 350px;
}

.margin {
  margin: 0 20px;
}

</style>
