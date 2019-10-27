<template>
  <div v-if="user" class="Profile" :class="platform">
    <div class="header">
      <ProfileImg class="img" :enable='true'/>
      <div class="info">
        <ButtonApp
          type="dark"
          :class="{white: user.displayName}"
          :value="username"
          @click="addUsername"
        />
        <ButtonApp
          type="dark"
          class="white"
          :value="user.email"
          @click="changeEmail"
        />
      </div>
    </div>
    <ButtonApp type="dark" :value="l['Delete account']" @click="deleteAccount"/>
  </div>
</template>

<script>

import ProfileImgVue from './ProfileImg.vue'
import ButtonVue from '../Auth/Button.vue'

import { mapState, mapGetters } from 'vuex'

export default {
  components: {
    ProfileImg: ProfileImgVue,
    ButtonApp: ButtonVue,
  },
  methods: {
    addUsername() {
      this.pop({
        comp: 'ChangeUsername',
        callback: this.reload,
      })
    },
    changeEmail() {
      this.pop({
        comp: 'ChangeEmail',
        callback: this.reload,
      })
    },
    deleteAccount() {
      this.pop({
        comp: 'Confirm',
        payload: this.l["You're going to lose all of your data forever!"],
        callback: () => {
          this.$store.dispatch('deleteAccount')
        },
      })
    },
    reload() {
      window.location.reload()
    },
    pop(config) {
      this.$store.dispatch('pushPopup', config)
    },
  },
  computed: {
    ...mapState(['user']),
    ...mapGetters(['platform', 'l']),
    username() {
      if (this.user.displayName) return this.user.displayName
      return this.l["Add username"]
    },
  },
}

</script>

<style scoped>

.img {
  width: 125px;
  height: 125px;
}

.header {
  position: relative;
}

.info {
  position: absolute;
  display: inline-flex;
  height: 100px;
  margin-left: 50px;
  top: 10px;
  justify-content: space-around;
  flex-direction: column;
}

.mobile .info {
  display: flex;
  position: unset;
  margin-left: 0;
}

.white {
  color: var(--white);
}

</style>
