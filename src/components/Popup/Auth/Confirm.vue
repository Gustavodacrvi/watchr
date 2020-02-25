<template>
  <div class="Signin popup cb shadow rb scroll" :class="layout">
    <div class="tac title">
      <h3 class="pc">Are you sure?</h3>
    </div>
    <div class="content">
      <div class="mt">
        <span>{{ popup.payload }}</span>
      </div>
      <div class="mt">
        <ButtonApp
          value="Yes, I am aware of the consequences"
          @click="go"
        />
        <ButtonApp class="mt"
          value="No, I changed my mind"
          @click="close"
        />
      </div>
    </div>
  </div>
</template>

<script>

import ButtonVue from '../../Auth/Button.vue'

import { mapGetters, mapState } from 'vuex'

import firebase from 'firebase/app'

export default {
  components: {
    ButtonApp: ButtonVue,
  },
  methods: {
    go() {
      if (this.popup.callback) this.popup.callback()
      this.close()
    },
    close() {
      this.$store.dispatch('closePopup')
    }
  },
  computed: {
    ...mapState(['popup']),
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
