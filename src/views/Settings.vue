<template>
  <div class='settings background-color' :class='theme'>
    <div class='center'>
      <div v-if='isDesktop' class='fake-menu'></div>
      <div v-if='isDesktop' class='menu-wrapper' :class='theme'>
        <div ref='line' class='line'></div>
        <div class='menu'>
          <router-link
            class='txt el icon-el'
            ref='About'
            :to="{name: 'About'}"
          >
            <span class='el-icon'>
              <i class='fas fa-info fa-sm'></i>
            </span>
            <span class='el-txt'>About</span>
          </router-link>
          <router-link v-if='isLogged'
            class='txt el'
            ref='General'
            :to="{name: 'General'}"
          >
            <span class='el-icon'>
              <i class='fas fa-cog fa-sm'></i>
            </span>
            <span class='el-txt'>General</span>
          </router-link>
          <div class='margin'></div>
          <router-link
            class='txt el'
            ref='Privacy policy'
            :to="{name: 'Privacy policy'}"
          >Privacy policy</router-link>
          <router-link
            class='txt el'
            ref='Security policy'
            :to="{name: 'Security policy'}"
          >Security policy</router-link>
          <router-link
            class='txt el'
            ref='Terms of service'
            :to="{name: 'Terms of service'}"
          >Terms of service</router-link>
        </div>
      </div>
      <div class='text txt'>
        <transition name='fade' mode='out-in'>
          <router-view/>
        </transition>
        <div class='margin'></div>
        <div class='margin'></div>
        <div class='margin'></div>
        <div class='margin'></div>
        <div class='margin'></div>
        <div class='margin'></div>
        <div class='margin'></div>
      </div>
    </div>
    <div v-if='!isDesktop' class='mobile-menu background-color' :class='theme'>
      <div class='align'>
        <router-link
          class='txt mob-el'
          ref='About'
          :to="{name: 'About'}"
        >About</router-link>
        <router-link v-if='isLogged'
          class='txt mob-el'
          ref='General'
          :to="{name: 'General'}"
        >General</router-link>
        <router-link
          class='txt mob-el'
          ref='Privacy policy'
          :to="{name: 'Privacy policy'}"
        >Privacy policy</router-link>
        <router-link
          class='txt mob-el'
          ref='Security policy'
          :to="{name: 'Security policy'}"
        >Security policy</router-link>
        <router-link
          class='txt mob-el'
          ref='Terms of service'
          :to="{name: 'Terms of service'}"
        >Terms of service</router-link>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Watch } from 'vue-property-decorator'
import { State, Getter } from 'vuex-class'

@Component
export default class Help extends Vue {
  @State theme!: string
  @State isLogged!: boolean
  @Getter isDesktop!: boolean

  interval: any = null

  created() {
    if (this.$route.name === 'Settings')
      this.$router.replace('settings/about')
  }
  mounted() {
    if (this.isDesktop)
      this.addDesktopInterval()
  }
  beforeDestroy() {
    clearInterval(this.interval)
  }

  addDesktopInterval() {
    this.interval = setInterval(() => {
      if (this.$route.name) {
        const vue: any = this.$refs[this.$route.name] as any
        const el = vue.$el as HTMLElement
        const line = this.$refs.line as HTMLElement

        line.style.top = el.offsetTop + 'px'
        line.style.height = el.clientHeight + 'px'
      }
    }, 100)
  }

  @Watch('isDesktop')
  onChange() {
    if (this.isDesktop)
      this.addDesktopInterval()
    else clearInterval(this.interval)
  }
}

</script>

<style scoped>

.settings {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
}

.center {
  flex-basis: 1000px;
  margin: 0 10px;
  margin-top: 60px;
  display: flex;
  align-items: flex-start;
}

.text {
  flex-basis: 775px;
  text-align: justify;
  margin: 0 8px;
  text-justify: inter-word;
}

.mobile-menu {
  width: 100%;
  position: fixed;
  bottom: 0;
  height: 60px;
  box-shadow: 0 0 5px 10px #555;
  font-size: 1.1em;
  overflow: auto;
}

.align {
  position: absolute;
  top: 50%;
  margin: 0 6px;
  transform: translateY(-50%);
  white-space: nowrap;
}

.mob-el {
  padding: 0 8px;
  text-decoration: none;
  transition: color .3s;
}

.mob-el:hover, .mob-el.router-link-exact-active {
  color: #83B7E2;
}

.mobile-menu.light {
  box-shadow: 0 0 15px 10px #F8F7F6;
}

.mobile-menu.dark {
  box-shadow: 0 0 15px 10px #121212;
}

.mobile-menu::-webkit-scrollbar {
  width: 0px;
  background: transparent;
}

.menu-wrapper {
  position: fixed;
  flex-basis: 225px;
}

.fake-menu {
  flex-basis: 225px;
}

.menu-wrapper.dark {
  border-left: 2px solid #292929;
}

.menu-wrapper.light {
  border-left: 2px solid #D9D9D9;
}

.fas {
  position: relative;
  bottom: 1.5px;
  margin-right: 8px;
}

.menu {
  position: relative;
  left: -1px;
}

.margin {
  height: 25px;
}

.el {
  display: block;
  padding: 6px;
  width: 100%;
  padding-left: 12px;
  text-decoration: none;
  font-size: 1.1em;
  transition: color .3s, border .3s, padding .3s;
}

.el:hover, .el.router-link-exact-active {
  color: #83B7E2;
  position: relative;
  left: -1px;
  padding-left: 13px;
}

.line {
  position: absolute;
  width: 2px;
  background-color: #83B7E2;
  left: -2px;
  transition: top .3s, height .3s;
}

.icon-el {
  display: flex;
  width: 100%;
}

.el-icon {
  flex-basis: 30px;
  text-align: center;
}

.el-txt {
  flex-basis: 100%;
}

</style>
