<template>
  <div v-if="user" class="Profile" :class="platform">
    <div class="header">
      <ProfileImg class="img" :src="user.photoURL"/>
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
  mounted() {
    console.log(this.user)
  },
  methods: {
    addUsername() {
      this.$store.dispatch('pushPopup', {
        comp: 'ChangeUsername',
        callback: () => window.location.reload(),
      })
    },
    changeEmail() {
      
    }
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
  margin-left: 20px;
}

.white {
  color: var(--white);
}

</style>
