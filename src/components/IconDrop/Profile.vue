
<template>
  <div class="Profile">
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
  </div>
</template>

<script>

import ButtonVue from '../Auth/Button.vue'

import { mapState, mapGetters } from 'vuex'

export default {
  props: ['content'],
  components: {
    ButtonApp: ButtonVue,
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
  margin: 0 20px;
}

</style>
