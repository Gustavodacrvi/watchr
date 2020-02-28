<template>
  <div class="NavBar" :class="layout" @click="calculateLineOffset">
    <Desktop v-if="isDesktopBreakPoint" :route="route" :dropLinks="dropLinks"/>
    <Mobile v-else :route="route" :dropLinks="dropLinks" @open-menu='$emit("open-menu")'/>
  </div>
</template>

<script>

import DesktopVue from './Desktop.vue'
import MobileVue from './Mobile.vue'

import { mapGetters, mapState } from 'vuex'

export default {
  props: ['route'],
  components: {
    Desktop: DesktopVue,
    Mobile: MobileVue,
  },
  mounted() {
    this.calculateLineOffset()
    setInterval(() => {
      this.calculateLineOffset()
    }, 1000)
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
    ...mapGetters(['isDesktopBreakPoint', 'layout']),
    dropLinks() {
      if (!this.user)
        return [
            {
              name: 'Sign up',
              icon: 'user-plus',
              callback: (close) => this.signUp()
            },
            {
              name: 'Sign in',
              icon: 'out',
              callback: () => this.signIn()
            }
          ]
      return [
        {
          name: 'Profile',
          icon: 'user',
          callback: () => {this.openProfile()}
        },
        {
          name: 'Log out',
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
  height: 45px;
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
