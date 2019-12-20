<template>
  <div class="NavBar" :class="platform" @click="calculateLineOffset">
    <Desktop v-if="isDesktop" :route="route" :dropLinks="dropLinks"/>
    <Mobile v-else :route="route" :dropLinks="dropLinks" @open-menu='$emit("open-menu")'/>
  </div>
</template>

<script>

import DesktopVue from './Desktop.vue'
import MobileVue from './Mobile.vue'

import { mapGetters, mapState } from 'vuex'

export default {
  components: {
    Desktop: DesktopVue,
    Mobile: MobileVue,
  },
  mounted() {
    this.calculateLineOffset()
    setInterval(() => {
      this.calculateLineOffset()
    }, 200)
    window.addEventListener('resize', this.calculateLineOffset)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.calculateLineOffset)
  },
  methods: {
    calculateLineOffset() {
      const link = this.activeLink()
      const line = this.line()
      if (line && link)
        line.style.left = (link.offsetLeft + (link.offsetWidth / 2) - 10) + 'px'
    },
    line() {
      const el = this.$el.getElementsByClassName('line')[0]
      if (el) return el
    },
    activeLink() {
      const link = this.$el.getElementsByClassName('active')[0]
      if (link) return link
    },
    signUp() {
      this.$store.dispatch('pushPopup', {comp: 'Signup'})
    },
    signIn() {
      this.$store.dispatch('pushPopup', {comp: 'Signin'})
    },
    logOut() {
      this.$store.dispatch('logOut')
    },
      openProfile() {
      this.$store.dispatch('pushPopup', {
        comp: 'Profile'
      })
    },
  },
  computed: {
    ...mapState(['user']),
    ...mapGetters(['isDesktop', 'platform', 'l']),
    route() {
      if (this.$route.matched[0]) {
        return this.$route.matched[0].name
      }
      return this.$route.name
    },
    dropLinks() {
      if (!this.user)
        return [
            {
              name: this.l['Sign up'],
              icon: 'user-plus',
              callback: (close) => this.signUp()
            },
            {
              name: this.l['Sign in'],
              icon: 'out',
              callback: () => this.signIn()
            }
          ]
      return [
        {
          name: this.l['Profile'],
          icon: 'user',
          callback: () => {this.openProfile()}
        },
        {
          name: this.l['Log out'],
          icon: 'out',
          important: true,
          callback: () => this.logOut(),
        }
      ]
    }
  },
}

</script>

<style scoped>


.NavBar {
  position: relative;
  height: 65px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
}

.NavBar.mobile {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  background-color: var(--back-color);
}

</style>
