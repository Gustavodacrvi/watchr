<template>
  <div class="NavBar" :class="platform" @click="calculateLineOffset">
    <Desktop v-if="isDesktop" :route="route" :dropLinks="dropLinks"/>
    <Mobile v-else :route="route" :dropLinks="dropLinks"/>
  </div>
</template>

<script>

import { mapGetters } from 'vuex'
import DesktopVue from './Desktop.vue'
import MobileVue from './Mobile.vue'

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
      if (line && link) {
        line.style.left = link.offsetLeft + 'px'
        line.style.width = link.offsetWidth + 'px'
      }
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
  },
  computed: {
    ...mapGetters(['isDesktop', 'platform']),
    route() {
      if (this.$route.matched[0]) {
        return this.$route.matched[0].name
      }
      return this.$route.name
    },
    dropLinks() {
      return [
        {
          name: 'Sign up',
          icon: 'user-plus',
          callback: () => this.signUp()
        },
        {
          name: 'Sign in',
          icon: 'out',
          callback: () => this.signIn()
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
