<template>
  <div class="NavBar" @click="calculateLineOffset">
    <router-link class="link" :class="{active: route === 'home'}" to="/">Home</router-link>
    <router-link class="link" :class="{active: route === 'user'}" to="/user">User</router-link>
    <router-link class="link" :class="{active: route === 'about'}" to="/about">About</router-link>
    <div class="line"></div>
  </div>
</template>

<script>

export default {
  mounted() {
    this.calculateLineOffset()
    setTimeout(() => {
      this.calculateLineOffset()
    }, 80)
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
  },
  computed: {
    route() {
      if (this.$route.matched[0]) {
        return this.$route.matched[0].name
      }
      return this.$route.name
    },
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
}

.link {
  text-decoration: none;
  color: var(--white);
  font-size: 1.05em;
  display: inline-block;
  padding: 0 14px;
  transition-duration: .2s;
}

.link.active, .link:hover {
  color: var(--primary);
}

.line {
  position: absolute;
  background-color: var(--primary);
  border-radius: 2px;
  height: 3px;
  width: 50px;
  bottom: 0;
  transition-duration: .2s;
}

</style>
