<template>
  <div
    class='wrapper'
    :class='[platform, {zindex: activeZindex && !isDesktop}]'
  >
    <div
      class='appbar gray'
      :class='platform'
    >
      <transition
        name='fade'
        mode='out-in'
      >
        <component
          class='theappbar gray'
          :class='theme'
          :is='appMenu'
          @change='changeMenu'
          @theme='changeTheme'
        ></component>
      </transition>
    </div>
    <div v-if='!isDesktop'
      class='appbar-margin'
      @click='closeAppBar'
    ></div>
  </div>
</template>

<script lang="ts">

import { Component, Vue, Watch } from 'vue-property-decorator'
import { State, Getter, Mutation } from 'vuex-class'

import LoadingComponent from '@/components/LoadingComponent.vue'
import ErrorComponent from '@/components/ErrorComponent.vue'

import appUtils from '@/utils/app'

@Component({
  components: {
    appnav: appUtils.AsyncComponent(import(/* webpackChunkName: "appnav-app" */ './Appnav.vue')),
    settingsnav: appUtils.AsyncComponent(/* webpackChunkName: "appnav-settings" */ import('./Settingsnav.vue')),
  },
})
export default class TheNavBar extends Vue {
  @State theme!: string
  @State appBarState!: string
  @State isLogged!: boolean
  @State emailVerified!: boolean
  @Mutation pushTheme!: (theme: string) => void
  @Mutation closeAppBar!: () => void
  @Getter isDesktop!: boolean
  @Getter loggedAndVerified!: boolean
  @Getter platform!: 'mobile' | 'desktop'
  @Getter isStandAlone!: boolean

  appMenu: 'settingsnav' | 'appnav' = 'settingsnav'
  activeZindex: boolean = true

  created() {
    if ((this.isDesktop || this.isStandAlone) && this.loggedAndVerified)
      this.appMenu = 'appnav'
    else
      this.appMenu = 'settingsnav'
  }

  changeTheme() {
    if (this.theme === 'dark')
      this.pushTheme('light')
    else
      this.pushTheme('dark')
  }
  changeMenu() {
    if (this.appMenu === 'appnav')
      this.appMenu = 'settingsnav'
    else
      this.appMenu = 'appnav'
  }

  @Watch('isLogged')
  onAuthChange() {
    if (!this.loggedAndVerified)
      this.appMenu = 'settingsnav'
    else this.appMenu = 'appnav'
  }
  @Watch('appBarState')
  onChange() {
    if (this.appBarState)
      this.activeZindex = true
    else setTimeout(() => {
      this.activeZindex = false
    }, 300)
  }
}

</script>

<style scoped>

.wrapper, .theappbar {
  display: flex;
}

.wrapper {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  z-index: 35;
}

.wrapper.desktop {
  width: 300px;
}

.zindex {
  z-index: 950;
}

.appbar {
  width: 300px;
}

.appbar-margin {
  flex-grow: 1;
}

.theappbar {
  position: relative;
  height: 100%;
  height: 100%;
  flex-direction: column;
}

</style>
